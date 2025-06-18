from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.user import User
from app.auth import routes as auth_routes
from app.database import Base, engine
from app.config import settings
from app.api import facebook

Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(lifespan=lifespan)

allowed_origins = ["http://localhost:3000", "http://localhost:3001"]
if settings.ENVIRONMENT == "production":
    allowed_origins = [settings.FRONTEND_URL]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/auth")
app.include_router(facebook.router, prefix="/api")
