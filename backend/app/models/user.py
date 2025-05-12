from sqlalchemy import Column, String, Boolean
from sqlalchemy.ext.declarative import declarative_base
from app.database import db_session

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    email = Column(String, primary_key=True)
    password = Column(String, nullable=True)  
    is_google = Column(Boolean, default=False)

def get_user_by_email(db, email):
    return db.query(User).filter(User.email == email).first()

def create_user(db, email, password=None, is_google=False):
    user = User(email=email, password=password, is_google=is_google)
    db.add(user)
    db.commit()
