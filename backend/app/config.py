import os
from dotenv import load_dotenv

env_mode = os.getenv("ENVIRONMENT", "development")

if env_mode == "production":
    dotenv_path = ".env.production"
else:
    dotenv_path = ".env.local"

load_dotenv(dotenv_path=dotenv_path)

class Settings:
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    JWT_SECRET = os.getenv("JWT_SECRET")
    DATABASE_URL = os.getenv("DATABASE_URL")
    FRONTEND_URL = os.getenv("FRONTEND_URL")
    ENVIRONMENT = env_mode

    required = [GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, DATABASE_URL]
    for name, val in zip(['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'JWT_SECRET', 'DATABASE_URL'], required):
        assert val, f"Missing required env: {name}"

settings = Settings()
