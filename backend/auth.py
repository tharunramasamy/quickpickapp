import jwt
from datetime import datetime, timedelta

SECRET = "quickpick-secret"
ALGO = "HS256"

def create_token(username: str, role: str):
    payload = {
        "sub": username,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET, algorithm=ALGO)