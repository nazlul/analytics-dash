from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str



@router.post("/login")
def login(data: LoginRequest):
    if not data.email or not data.password:
        raise HTTPException(status_code=400, detail="Missing credentials")

    return {
        "message": "Login successful",
        "access_token": "demo-token",
        "user": {
            "email": data.email
        }
    }


@router.post("/register")
def register(data: RegisterRequest):
    return {
        "message": "User created",
        "user": {
            "email": data.email,
            "name": data.name
        }
    }

@router.get("/me")
def get_me():
    return {
        "email": "demo@user.com",
        "name": "Demo User"
    }

@router.get("/protected")
def protected():
    return {
        "message": "You are authenticated",
        "user": {
            "email": "demo@user.com"
        }
    }