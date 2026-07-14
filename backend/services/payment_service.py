from datetime import datetime, timezone

from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.config.jobs import enqueue_job
from backend.config.settings import get_settings
from backend.models.payment import Payment


def initiate_checkout(
    user_id: str, amount_tzs: float, mobile_number: str, provider: str, idempotency_key: str | None = None
) -> dict:
    settings = get_settings()
    sandbox = getattr(settings, "azampay_sandbox", True)

    _gen = get_db()
    db: Session = next(_gen)
    try:
        if idempotency_key:
            existing = db.query(Payment).filter(Payment.idempotency_key == idempotency_key).first()
            if existing:
                return {
                    "id": existing.id,
                    "amount_tzs": existing.amount_tzs,
                    "provider": existing.provider,
                    "provider_reference": existing.provider_reference,
                    "status": existing.status,
                    "idempotent": True,
                }

        payment = Payment(
            user_id=user_id,
            amount_tzs=amount_tzs,
            provider=provider,
            idempotency_key=idempotency_key,
            status="pending",
        )
        db.add(payment)
        db.commit()

        if sandbox:
            return {
                "id": payment.id,
                "amount_tzs": amount_tzs,
                "provider": provider,
                "status": "pending",
                "sandbox": True,
                "note": "Sandbox mode — no real charge will be made",
            }

        enqueue_job("high", "backend.tasks.payments.process_checkout", payment.id, mobile_number)

        return {
            "id": payment.id,
            "amount_tzs": amount_tzs,
            "provider": provider,
            "status": "pending",
            "sandbox": False,
        }
    finally:
        _gen.close()


def handle_webhook_payload(payload: dict) -> dict:
    _gen = get_db()
    db: Session = next(_gen)
    try:
        payment_id = payload.get("external_id")
        status = payload.get("status", "failed")
        reference = payload.get("reference")
        idempotency_key = payload.get("idempotency_key")

        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise ValueError("Payment not found")

        if payment.status == "success":
            return {"id": payment.id, "status": payment.status, "idempotent": True}

        payment.status = "success" if status == "success" else "failed"
        payment.provider_reference = reference
        if idempotency_key:
            payment.idempotency_key = idempotency_key
        db.commit()

        enqueue_job("default", "backend.tasks.payments.handle_payment_completion", payment.id)

        return {"id": payment.id, "status": payment.status}
    finally:
        _gen.close()
