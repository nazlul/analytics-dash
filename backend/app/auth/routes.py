from datetime import timedelta
import os
import requests 
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Cookie, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional
from jose import JWTError, jwt
from app.database import get_db 
from app.models import delete_user_by_email, get_user_by_email, create_user
from app.auth import utils
from app import config
from fastapi.responses import JSONResponse

from app.dependencies import get_current_user

router = APIRouter()
load_dotenv(dotenv_path="C:/Users/bbiig/Github/Ads-Dash/backend/.env.local")
SECRET = os.getenv("JWT_SECRET")

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: str
    password: str

class User(BaseModel):
    email: str

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
    verify_link = f"http://localhost:3000/verify-email?token={token}"  
    utils.send_verification_email(data.email, token)

    return {
        "message": "Registration successful. Please check your email to verify.",
        "verify_link": verify_link,
        "open_gmail": "https://mail.google.com/"
    }

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

    access_token = utils.create_access_token(data.email)
    refresh_token = utils.create_refresh_token(data.email, remember_me=data.remember_me)

    response = JSONResponse(content={
        "message": "Login successful",
        "redirect_url": "/dashboard",
        "access_token": access_token
    })

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production
        samesite="Lax",
        max_age=60 * 60 * 24 * 90
    )
    return response  

@router.post("/google-login")
async def google_login(data: GoogleLoginRequest, db: Session = Depends(get_db)):
    info = await utils.get_google_user_info(data.token)
    if not info:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = info["email"]
    user = get_user_by_email(db, email)
    if not user:
        create_user(db, email=email, password=None, is_google=True)

    access_token = utils.create_access_token(email)  
    refresh_token = utils.create_refresh_token(email, remember_me=True)

    response = JSONResponse(content={
        "access_token": access_token,
        "message": "Login successful",
        "redirect_url": "/dashboard"
    })

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=60 * 60 * 24 * 30  
    )
    return response


@router.post("/refresh-token")
def refresh_token(request: Request):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="Refresh token missing")
    try:
        payload = jwt.decode(token, SECRET, algorithms=["HS256"])
        email = payload.get("email")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    new_access_token = utils.create_access_token(email)
    return {"access_token": new_access_token}

@router.get("/protected")
def get_facebook_ad_data(current_user: User = Depends(utils.get_current_user)):
    fb_access_token = "facebook_access_token"  
    ad_account_id = "1234567890"               
    url = f"https://graph.facebook.com/v19.0/{ad_account_id}/insights"
    params = {
        "access_token": fb_access_token,
        "fields": "campaign_name,clicks,impressions,cpc,ctr",
        "date_preset": "last_30d"
    }

    try:
        res = requests.get(url, params=params)
        data = res.json()

        if "data" in data:
            return {"dashboard": data["data"]}
        else:
            raise ValueError("Invalid response from Facebook API")

    except Exception:
        return {
            "dashboard": [
                {
                    "campaign_name": "Mock Campaign 1",
                    "clicks": 120,
                    "impressions": 1000,
                    "cpc": 0.50,
                    "ctr": 12.0
                },
                {
                    "campaign_name": "Mock Campaign 2",
                    "clicks": 80,
                    "impressions": 800,
                    "cpc": 0.65,
                    "ctr": 10.0
                }
            ]
        }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}

@router.get("/me")
def get_me(user: User = Depends(utils.get_current_user)):
    return user

@router.get("/dashboard")
def protected_route(email: str = Depends(get_current_user)):
    return {"message": f"Welcome user {email}"}


@router.delete("/delete-user")
def delete_user(email: str = Query(...), db: Session = Depends(get_db)):
    success = delete_user_by_email(db, email)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": f"User {email} deleted successfully"}
