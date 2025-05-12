from passlib.hash import bcrypt
from jose import jwt
import httpx
import os
from dotenv import load_dotenv

load_dotenv()
SECRET = os.getenv("JWT_SECRET")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

def hash_password(password): return bcrypt.hash(password)
def verify_password(plain, hashed): return bcrypt.verify(plain, hashed)
def create_jwt(email): return jwt.encode({"email": email}, SECRET, algorithm="HS256")

async def get_google_user_info(token: str):
    async with httpx.AsyncClient() as client:
        res = await client.get(f"https://www.googleapis.com/oauth2/v3/tokeninfo?id_token={token}")
        if res.status_code != 200: 
            return None
        data = res.json()
        if data.get("aud") != GOOGLE_CLIENT_ID:
            return None  
        return data
q