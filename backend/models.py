from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# ============ AUTH MODELS ============

class LoginRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str

class SignupRequest(BaseModel):
    email: Optional[str] = None
    phone: str
    password: str
    first_name: str
    last_name: str
    role: str  # CUSTOMER, INVENTORY_STAFF, DELIVERY_PARTNER
    city_id: Optional[int] = None

class LoginResponse(BaseModel):
    user_id: str
    token: str
    role: str
    city_id: Optional[int]
    user_name: str

# ============ USER MODELS ============

class UserProfile(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    phone: str
    email: Optional[str]
    address: Optional[str]
    city: Optional[str]
    pincode: Optional[str]
    is_verified: bool

# ============ PRODUCT MODELS ============

class Product(BaseModel):
    product_id: str
    product_name: str
    category_id: int
    price: float
    unit: str
    description: Optional[str]
    image_url: Optional[str]
    is_active: bool

class ProductWithStock(Product):
    quantity_available: int
    is_out_of_stock: bool

# ============ ORDER MODELS ============

class OrderItem(BaseModel):
    product_id: str
    quantity: int
    unit_price: float
    total_price: float

class CreateOrderRequest(BaseModel):
    items: List[OrderItem]
    delivery_address: str
    delivery_latitude: Optional[float]
    delivery_longitude: Optional[float]
    customer_notes: Optional[str] = None
    city_id: int

class OrderResponse(BaseModel):
    order_id: str
    status: str
    total_amount: float
    created_at: datetime

class OrderTrackingResponse(BaseModel):
    order_id: str
    status: str
    location_name: Optional[str]
    delivery_partner_name: Optional[str]
    estimated_delivery_time: Optional[datetime]
    last_update: datetime

# ============ INVENTORY MODELS ============

class UpdateInventoryRequest(BaseModel):
    product_id: str
    quantity: int
    action: str  # ADD, REDUCE, SET

class InventoryStockResponse(BaseModel):
    product_id: str
    product_name: str
    quantity_available: int
    quantity_reserved: int
    reorder_level: int

# ============ PAYMENT MODELS ============

class PaymentIntentRequest(BaseModel):
    order_id: str
    amount: float
    payment_method: str

class PaymentIntentResponse(BaseModel):
    client_secret: str
    amount: float

# ============ DELIVERY MODELS ============

class AssignDeliveryRequest(BaseModel):
    order_id: str
    delivery_partner_id: int

class DeliveryPartnerInfo(BaseModel):
    partner_id: int
    user_id: str
    name: str
    phone: str
    vehicle_type: str
    total_deliveries: int
    average_rating: float
    is_available: bool