# backend/database.py
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URI)
db = client["snaptranslate"]  # ชื่อฐานข้อมูลตามที่ใช้จริง

def get_db() -> AsyncIOMotorDatabase:
    return db
