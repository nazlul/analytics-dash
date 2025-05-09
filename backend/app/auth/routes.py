from fastapi import APIRouter, HTTPException, Request
from app.auth.utils import verify_password, hash_password, create_jwt, get_google_user_info
from app.models.user import User, get_user_by_email, create_user
from app.database import db_session

router = APIRouter()

@router.post("/manual-login")
async def manual_login(data: dict):
    email = data["email"]
    password = data["password"]
    user = get_user_by_email(db_session, email)
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"token": create_jwt(user.email)}

@router.post("/manual-register")
async def manual_register(data: dict):
    email = data["email"]
    password = hash_password(data["password"])
    if get_user_by_email(db_session, email):
        raise HTTPException(status_code=400, detail="Email already registered")
    create_user(db_session, email, password)
    return {"msg": "User created"}

@router.post("/google-login")
async def google_login(request: Request):
    token = (await request.json()).get("token")
    user_info = await get_google_user_info(token)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid Google token")
    email = user_info["email"]
    user = get_user_by_email(db_session, email)
    if not user:
        create_user(db_session, email, "")
    return {"token": create_jwt(email)}
