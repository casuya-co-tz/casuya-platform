from sqlalchemy.orm import Session

from backend.config.database import get_db
from backend.config.settings import get_settings
from backend.integrations.azampay import mobile_checkout
from backend.models.payment import Payment


def process_checkout(payment_id: str, mobile_number: str):
    settings = get_settings()
    db: Session = next(get_db())
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        return

    try:
        result = mobile_checkout(
            amount_tzs=payment.amount_tzs,
            mobile_number=mobile_number,
            provider=payment.provider,
            external_id=payment.id,
        )
        payment.provider_reference = result.get("reference")
        payment.status = "success"
    except Exception as e:
        payment.status = "failed"
    db.commit()


def handle_payment_completion(payment_id: str):
    db: Session = next(get_db())
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment or payment.status != "success":
        return
    from backend.integrations.africastalking import send_sms
    from backend.models.user import User

    user = db.query(User).filter(User.id == payment.user_id).first()
    if user and user.phone:
        try:
            send_sms(
                to=user.phone,
                message=f"Payment of {payment.amount_tzs:.0f} TZS received. Thank you!",
            )
        except Exception:
            pass
