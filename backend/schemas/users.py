from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    email: str
    phone: str | None
    role: str
    is_active: bool


class UserUpdateRequest(BaseModel):
    phone: str | None = None
    full_name: str | None = None
