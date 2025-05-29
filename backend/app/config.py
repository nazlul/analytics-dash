import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="C:/Users/bbiig/Github/Ads-Dash/backend/.env.local")

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
JWT_SECRET = os.getenv("JWT_SECRET")

assert GOOGLE_CLIENT_ID, "Missing GOOGLE_CLIENT_ID in .env.local"
assert GOOGLE_CLIENT_SECRET, "Missing GOOGLE_CLIENT_SECRET in .env.local"
assert JWT_SECRET, "Missing JWT_SECRET in .env.local"
