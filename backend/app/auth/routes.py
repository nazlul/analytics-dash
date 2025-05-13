from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.models.user import User, get_user_by_email, create_user
from app.auth import utils
from app import config

router = APIRouter()

class RegisterRequest(BaseModel):
    email: str
    password: str

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

    token = utils.create_jwt(data.email)
    return {"access_token": token}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = get_user_by_email(db, data.email)
    if not user or not user.password:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not utils.verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid password")

    token = utils.create_jwt(data.email)  
    return {"access_token": token}

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
