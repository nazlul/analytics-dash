from fastapi import APIRouter, HTTPException, Request, Depends
from app.auth.utils import verify_password, hash_password, create_jwt, get_google_user_info
from app.models.user import User, get_user_by_email, create_user
from app.database import get_db
from sqlalchemy.orm import Session

router = APIRouter()

@router.post("/manual-login")
async def manual_login(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {"token": create_jwt(user.email)}


@router.post("/manual-register")
async def manual_register(data: dict, db: Session = Depends(get_db)):
    email = data.get("email")
    password_raw = data.get("password")

    if not email or not password_raw:
        raise HTTPException(status_code=400, detail="Email and password are required")

    if get_user_by_email(db, email):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(password_raw)
    create_user(db, email, hashed_password)

    return {"msg": "User created"}


@router.post("/google-login")
async def google_login(request: Request, db: Session = Depends(get_db)):
    body = await request.json()
    token = body.get("token")

    if not token:
        raise HTTPException(status_code=400, detail="Missing Google token")

    user_info = await get_google_user_info(token)
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = user_info.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google token missing email")

    user = get_user_by_email(db, email)
    if not user:
        create_user(db, email=email, is_google=True)  

    return {"token": create_jwt(email)}
