from datetime import datetime, timezone

from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.models.payment import Payment


def initiate_checkout(user_id: str, amount_tzs: float, mobile_number: str, provider: str) -> dict:
    db: Session = next(get_db())
    payment = Payment(
        user_id=user_id,
        amount_tzs=amount_tzs,
        provider=provider,
        status="pending",
    )
    db.add(payment)
    db.commit()
    return {"id": payment.id, "amount_tzs": amount_tzs, "provider": provider, "status": "pending"}


def handle_webhook_payload(payload: dict) -> dict:
    db: Session = next(get_db())
    payment_id = payload.get("external_id")
    status = payload.get("status", "failed")
    reference = payload.get("reference")
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise ValueError("Payment not found")
    payment.status = "success" if status == "success" else "failed"
    payment.provider_reference = reference
    db.commit()
    return {"id": payment.id, "status": payment.status}
