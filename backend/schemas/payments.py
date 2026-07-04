from pydantic import BaseModel


class CheckoutRequest(BaseModel):
    amount_tzs: float
    mobile_number: str
    provider: str = "azampay"


class PaymentResponse(BaseModel):
    id: str
    amount_tzs: float
    provider: str
    provider_reference: str | None
    status: str
