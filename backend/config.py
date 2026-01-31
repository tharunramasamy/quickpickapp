from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    db_server: str
    db_name: str
    db_user: str
    db_password: str
    db_port: int = 1433
    db_driver: str = "ODBC Driver 17 for SQL Server"
    
    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    
    # Stripe
    stripe_secret_key: str
    stripe_public_key: str
    
    # API
    api_base_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:5173"
    
    # CORS
    allowed_origins: list = [
        "http://localhost:5173",
        "http://localhost:3000"
    ]
    
    class Config:
        env_file = ".env"

settings = Settings()