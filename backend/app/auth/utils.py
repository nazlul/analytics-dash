import os
from datetime import datetime, timedelta, timezone
import smtplib
from dotenv import load_dotenv
from passlib.hash import bcrypt
from typing import Optional
from jose import jwt, JWTError
import httpx
from email.message import EmailMessage

load_dotenv()

SECRET = os.getenv("JWT_SECRET")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
VERIFICATION_EXPIRY_HOURS = 1
FRONTEND_URL = os.getenv("FRONTEND_URL")
assert FRONTEND_URL, "FRONTEND_URL must be set in environment"

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

# def send_verification_email(to_email: str, token: str):
#     link = f"{FRONTEND_URL}/verify-email?token={token}" 
#     msg = EmailMessage()
#     msg["Subject"] = "Verify Your Email"
#     msg["From"] = os.getenv("SMTP_FROM")
#     msg["To"] = to_email
#     msg.set_content(f"Click the link to verify your email:\n{link}")

#     with smtplib.SMTP_SSL(os.getenv("SMTP_HOST"), 465) as smtp:
#         smtp.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASS"))
#         smtp.send_message(msg)

def send_verification_email(email: str, token: str):
    print(f"📧 Mock email to {email} with link:")
    print(f"http://localhost:3000/verify-email?token={token}")


def create_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + expires_delta
    return jwt.encode(to_encode, SECRET, algorithm="HS256")

def create_access_token(email: str) -> str:
    return create_token({"email": email}, timedelta(minutes=30))

def create_refresh_token(email: str, remember_me: bool = False) -> str:
    if remember_me:
        return create_token({"email": email}, timedelta(days=365 * 10)) 
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
