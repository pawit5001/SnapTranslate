import logging
from datetime import datetime
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

logger = logging.getLogger("feedback_service")

async def save_feedback(db: AsyncIOMotorDatabase, feedback: dict) -> str:
    filter_query = {
        "user_email": feedback["user_email"],
        "translation_id": feedback["translation_id"]
    }
    update_data = {
        "$set": {
            "feedback": feedback["feedback"],
            "timestamp": datetime.utcnow(),
            "original_text": feedback.get("original_text"),
        }
    }
    result = await db.feedback.update_one(filter_query, update_data, upsert=True)
    if result.upserted_id:
        logger.info(f"[Feedback] Inserted new feedback: {feedback}")
        return "insert"
    elif result.modified_count > 0:
        logger.info(f"[Feedback] Updated existing feedback: {feedback}")
        return "update"
    else:
        logger.info(f"[Feedback] Feedback already up-to-date: {feedback}")
        return "noop"

async def get_feedback_stats(db: AsyncIOMotorDatabase, translation_id: Optional[str] = None) -> dict:
    query = {}
    if translation_id:
        query["translation_id"] = translation_id

    pipeline = [
        {"$match": query},
        {"$group": {"_id": "$feedback", "count": {"$sum": 1}}}
    ]
    cursor = db.feedback.aggregate(pipeline)
    stats = {"up": 0, "down": 0, "total": 0}
    async for doc in cursor:
        key = doc["_id"]
        if key in ["up", "down"]:
            stats[key] = doc["count"]
            stats["total"] += doc["count"]
    logger.info(f"[Feedback] Stats: {stats}")
    return stats
