import httpx
import logging
from backend.database import db

logger = logging.getLogger("discord_logger")

async def send_discord_log(message: str):
    try:
        setting = await db.webhooks.find_one({})
        if not setting or not setting.get("discord_webhook_url"):
            logger.warning("Discord webhook URL not configured.")
            return

        webhook_url = setting["discord_webhook_url"]
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json={"content": message})
            if response.status_code != 204 and response.status_code != 200:
                logger.error(f"Failed to send Discord log: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Exception when sending Discord log: {e}")
