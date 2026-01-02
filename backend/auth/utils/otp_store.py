from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URI)
db = client["snaptranslate"]
otp_collection = db["reset_otps"]

async def save_reset_otp_for_email(email: str, otp: str, expires_at: datetime):
    await otp_collection.update_one(
        {"email": email},
        {"$set": {"otp": otp, "expires_at": expires_at}},
        upsert=True
    )

async def verify_reset_otp(email: str, otp: str) -> bool:
    data = await otp_collection.find_one({"email": email, "otp": otp})
    if not data:
        return False
    if datetime.utcnow() > data["expires_at"]:
        return False
    return True
