from .user import User
from app.database import Base, SessionLocal 
from sqlalchemy.orm import Session

print(Base, SessionLocal)

def create_user(db: Session, email: str, password: str = None, is_google: bool = False):
    db_user = User(email=email, hashed_password=password, is_google=is_google)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def delete_user_by_email(db: Session, email: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True

