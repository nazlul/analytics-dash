import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from passlib.hash import bcrypt
from jose import jwt, JWTError
import httpx

load_dotenv()

SECRET = os.getenv("JWT_SECRET")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

def hash_password(password: str) -> str:
    return bcrypt.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.verify(plain, hashed)

def create_token(data: dict, expires_delta: timedelta) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.now(datetime.timezone.utc) + expires_delta
    return jwt.encode(to_encode, SECRET, algorithm="HS256")

def create_access_token(email: str) -> str:
    return create_token({"email": email}, timedelta(minutes=30))

def create_refresh_token(email: str, remember_me: bool = False) -> str:
    if remember_me:
        return create_token({"email": email}, timedelta(days=365 * 10)) 
    return create_token({"email": email}, timedelta(days=30))

def decode_token(token: str) -> dict | None:
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
