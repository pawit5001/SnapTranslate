# backend/services/discord_webhook_service.py
import logging
import httpx
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime

logger = logging.getLogger("discord_webhook_service")


async def get_webhook(db: AsyncIOMotorDatabase) -> Optional[Dict[str, Any]]:
    """
    ดึง webhook ปัจจุบัน
    """
    logger.info("Querying database for Discord webhook...")
    record = await db.settings.find_one({"key": "discord_webhook"})
    if record:
        logger.info(f"Webhook record found: {record}")
        return {"url": record.get("value"), "updated_at": record.get("updated_at")}
    logger.warning("No webhook record found in the database.")
    return None


async def update_webhook(db: AsyncIOMotorDatabase, webhook_url: str) -> None:
    """
    อัปเดตหรือสร้าง webhook
    """
    await db.settings.update_one(
        {"key": "discord_webhook"},
        {"$set": {"value": webhook_url, "updated_at": datetime.utcnow()}},
        upsert=True
    )
    logger.info(f"Webhook updated: {webhook_url}")


async def send_discord_log(db: AsyncIOMotorDatabase, image: str, language: str, translation: str):
    """
    ส่งข้อความไปยัง Discord webhook พร้อมรายละเอียดการแปล
    """
    try:
        setting = await get_webhook(db)
        if not setting or not setting.get("url"):
            logger.warning("Discord webhook not configured")
            return

        embed = {
            "embeds": [
                {
                    "title": "Translation Log",
                    "color": 3447003,
                    "fields": [
                        {"name": "Uploaded Image", "value": image or "No image provided", "inline": False},
                        {"name": "Selected Language", "value": language or "Not selected", "inline": True},
                        {"name": "Translation Result", "value": translation or "No result", "inline": True},
                    ],
                    "timestamp": datetime.utcnow().isoformat(),
                }
            ]
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(setting["url"], json=embed)
            if response.status_code not in [200, 204]:
                logger.error(f"Failed to send Discord log: {response.status_code}")
            else:
                logger.info("Discord log sent successfully")
    except Exception as e:
        logger.error(f"Exception sending Discord log: {e}", exc_info=True)


# backend/routes/webhook_routes.py
from fastapi import APIRouter, HTTPException, Depends
from backend.services.discord_webhook_service import get_webhook, update_webhook
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.database import get_db

router = APIRouter()

@router.post("/admin/save-webhook")
async def save_webhook(webhook_url: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    await update_webhook(db, webhook_url)
    return {"message": "Webhook URL saved successfully."}

@router.get("/admin/get-webhook")
async def retrieve_webhook(db: AsyncIOMotorDatabase = Depends(get_db)):
    webhook = await get_webhook(db)
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found.")
    return webhook
