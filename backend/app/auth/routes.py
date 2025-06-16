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
from app.models import delete_user_by_email, get_user_by_email, create_user, User as DBUser
from app.auth import utils
from app.config import settings
from app.auth.utils import create_access_token, get_current_user

router = APIRouter()
SECRET = settings.JWT_SECRET

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=1)
    email: str
    password: str

class User(BaseModel):
    email: str
    name: Optional[str] = None

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
    create_user(db, email=data.email, password=hashed_pw, is_google=False, name=data.name)
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
        access_token = utils.create_access_token(user.email)
        refresh_token = utils.create_refresh_token(user.email, remember_me=True)
        response = JSONResponse(content={
            "message": "Email verified successfully",
            "redirect_url": "/dashboard",
            "access_token": access_token
        })
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=60 * 60 * 24 * 30,
            path="/"
        )
        return response
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
        secure=False,
        samesite="Lax",
        max_age=60 * 60 * 24 * 90,
        path="/"
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
        create_user(db, email=email, password=None, is_google=True, name=info.get("name"))
    if not user.is_verified:
        user.is_verified = True
        db.commit()
        db.refresh(user)
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
        secure=False,
        samesite="Lax",
        max_age=60 * 60 * 24 * 30,
        path="/"
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

@router.post("/refresh")
async def refresh_token_endpoint(refresh_token: Optional[str] = Cookie(None)):
    if refresh_token is None:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    payload = utils.decode_token(refresh_token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Invalid token payload")

    new_access_token = utils.create_access_token(email)
    return JSONResponse(content={"access_token": new_access_token})


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=False,
        samesite="Lax",
        path="/"
    )
    return {"message": "Logged out"}

@router.get("/me")
def get_me(user: DBUser = Depends(get_current_user)):
    return {"email": user.email, "name": user.name}

@router.get("/all-users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(DBUser).all()
    return {"users": [{"email": u.email, "name": u.name} for u in users]}

@router.get("/dashboard")
def protected_route(email: str = Depends(get_current_user)):
    return {"message": f"Welcome user {email}"}

@router.delete("/delete-user")
def delete_user(
    email: str = Query(...),
    db: Session = Depends(get_db),
    response: Response = None
):
    success = delete_user_by_email(db, email)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=False,
        samesite="Lax",
        path="/"
    )
    return {"message": f"User {email} deleted and refresh token removed"}

@router.get("/protected")
def get_facebook_ad_data(current_user: DBUser = Depends(utils.get_current_user)):
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
