import os
from dotenv import load_dotenv

env_mode = os.getenv("ENVIRONMENT", "development")
dotenv_path = ".env.production" if env_mode == "production" else ".env.local"
load_dotenv(dotenv_path=dotenv_path)

class Settings:
    def __init__(self):
        self.ENVIRONMENT = env_mode
        self.GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
        self.GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
        self.JWT_SECRET = os.getenv("JWT_SECRET")
        self.DATABASE_URL = os.getenv("DATABASE_URL")
        self.FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")  

        self._validate()

    def _validate(self):
        required = {
            "GOOGLE_CLIENT_ID": self.GOOGLE_CLIENT_ID,
            "GOOGLE_CLIENT_SECRET": self.GOOGLE_CLIENT_SECRET,
            "JWT_SECRET": self.JWT_SECRET,
            "DATABASE_URL": self.DATABASE_URL
        }
        for name, value in required.items():
            if not value:
                raise EnvironmentError(f"Missing required environment variable: {name}")

settings = Settings()
