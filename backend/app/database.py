from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.user import Base

engine = create_engine("sqlite:///./app.db", connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
db_session = SessionLocal()

def create_db():
    Base.metadata.create_all(bind=engine)
