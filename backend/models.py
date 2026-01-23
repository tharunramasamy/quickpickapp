from pydantic import BaseModel
from typing import List

# ---------------- ORDER MODELS ----------------

class OrderItem(BaseModel):
    product_id: int
    quantity: int


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItem]
    payment_method: str


# ---------------- AUTH MODELS ----------------

class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    role: str