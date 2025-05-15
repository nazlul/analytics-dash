
import os
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from app.database import get_db 
from app.models import delete_user_by_email, get_user_by_email, create_user
from app.auth import utils
from app import config
from jose import JWTError, jwt
from fastapi import Query

router = APIRouter()

load_dotenv()

SECRET = os.getenv("JWT_SECRET")

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: str
    password: str

class ResendEmailRequest(BaseModel):
    email: str

class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: bool = False

class GoogleLoginRequest(BaseModel):
    token: str

@router.post("/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = utils.hash_password(data.password)
    create_user(db, email=data.email, password=hashed_pw, is_google=False)

    token = utils.create_email_verification_token(data.email)
    print("🔑 Email verification token:", token)
    print("✅ Reached email sending logic.")  
    utils.send_verification_email(data.email, token)
    # utils.send_verification_email(data.email, token)

    return {"message": "Registration successful. Please check your email to verify."}

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        user = get_user_by_email(db, payload["email"])
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.is_verified = True
        db.commit()
        return {"message": "Email verified successfully", "redirect_url": "/dashboard"}
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

@router.post("/resend-verification-email")
def resend_verification_email(req: ResendEmailRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, req.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email is already verified")

    token = utils.create_email_verification_token(req.email)
    utils.send_verification_email(req.email, token)
    return {"message": "Verification email resent"}


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if not user or not user.hashed_password:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email to continue")

    if not utils.verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = utils.create_jwt(data.email, remember_me=data.remember_me)  
    redirect_url = "/dashboard" if user.is_verified else "/verify-email"

    return {"access_token": token, "redirect_url": redirect_url}

@router.post("/google-login")
async def google_login(data: GoogleLoginRequest, db: Session = Depends(get_db)):
    info = await utils.get_google_user_info(data.token)
    if not info:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    
    email = info["email"]
    user = get_user_by_email(db, email)
    if not user:
        create_user(db, email=email, password=None, is_google=True)

    token = utils.create_jwt(email)
    return {"access_token": token}

@router.post("/logout")
def logout(request: Request):
    return {"message": "Logged out"}

@router.delete("/delete-user")
def delete_user(email: str = Query(...), db: Session = Depends(get_db)):
    success = delete_user_by_email(db, email)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {email} deleted successfully"}

