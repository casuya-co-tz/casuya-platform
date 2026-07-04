from fastapi import APIRouter, Depends, HTTPException, Request

from backend.middleware.auth import get_current_user
from backend.schemas.payments import CheckoutRequest, PaymentResponse
from backend.services.payment_service import handle_webhook_payload, initiate_checkout

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/checkout", response_model=PaymentResponse)
def create_checkout(body: CheckoutRequest, current_user=Depends(get_current_user)):
    try:
        result = initiate_checkout(
            user_id=current_user["sub"],
            amount_tzs=body.amount_tzs,
            mobile_number=body.mobile_number,
            provider=body.provider,
            idempotency_key=body.idempotency_key,
        )
        return PaymentResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def azampay_webhook(request: Request):
    payload = await request.json()
    try:
        return handle_webhook_payload(payload)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
