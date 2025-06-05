import os
import uuid
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from passlib.hash import bcrypt
from typing import Optional
from jose import jwt, JWTError
import httpx
from email.message import EmailMessage
from fastapi import Request, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from app.auth.schemas import User
from app.config import JWT_SECRET
from app.models import get_user_by_email
from app.database import get_db 
from sqlalchemy.orm import Session

load_dotenv(dotenv_path="C:/Users/bbiig/Github/Ads-Dash/backend/.env.local")
SECRET = os.getenv("JWT_SECRET")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
VERIFICATION_EXPIRY_HOURS = 1
FRONTEND_URL = os.getenv("FRONTEND_URL")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def hash_password(password: str) -> str:
    return bcrypt.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.verify(plain, hashed)

def create_email_verification_token(email: str):
    payload = {
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=VERIFICATION_EXPIRY_HOURS)
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def send_verification_email(email: str, token: str):
    print(f"📧 Mock email to {email} with link:")
    print(f"http://localhost:3000/verify-email?token={token}")

def create_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + expires_delta
    to_encode["jti"] = str(uuid.uuid4())
    return jwt.encode(to_encode, SECRET, algorithm="HS256")

def create_access_token(email: str) -> str:
    return create_token({"email": email}, timedelta(minutes=30))

def create_refresh_token(email: str, remember_me: bool = False) -> str:
    if remember_me:
        return create_token({"email": email}, timedelta(days=90))
    return create_token({"email": email}, timedelta(days=30))

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        return payload
    except JWTError:
        return None

async def get_google_user_info(token: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={token}")
        if res.status_code != 200:
            return None
        data = res.json()
        if data.get("aud") != GOOGLE_CLIENT_ID:
            return None
        return data

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        email = payload.get("email")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = get_user_by_email(db, email)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


