# backend/services/stats_service.py
import logging
from datetime import datetime
from typing import List, Dict
from motor.motor_asyncio import AsyncIOMotorDatabase
from backend.models.admin_models import UsageStat

logger = logging.getLogger("stats_service")


async def record_usage_stat(db: AsyncIOMotorDatabase, stat: UsageStat) -> None:
    """
    บันทึกหรืออัปเดต usage stats ของผู้ใช้
    """
    existing = await db.usage_stats.find_one({
        "user_email": stat.user_email,
        "language": stat.language,
        "image_class": stat.image_class,
    })

    if existing:
        await db.usage_stats.update_one(
            {"_id": existing["_id"]},
            {"$inc": {"count": stat.count}, "$set": {"last_used": datetime.utcnow()}}
        )
        logger.info(f"Updated usage stat for {stat.user_email}")
    else:
        data = stat.dict()
        if not data.get("last_used"):
            data["last_used"] = datetime.utcnow()
        await db.usage_stats.insert_one(data)
        logger.info(f"Inserted new usage stat for {stat.user_email}")


async def get_usage_stats_summary(db: AsyncIOMotorDatabase) -> List[Dict]:
    """
    สรุป usage stats ของผู้ใช้ทั้งหมด
    """
    pipeline = [
        {"$group": {"_id": "$user_email", "total_count": {"$sum": "$count"}, "last_used": {"$max": "$last_used"}}}
    ]
    cursor = db.usage_stats.aggregate(pipeline)
    summary = []
    async for doc in cursor:
        summary.append({
            "user_email": doc["_id"],
            "total_count": doc["total_count"],
            "last_used": doc.get("last_used")
        })
    logger.info(f"Usage stats summary fetched: {len(summary)} records")
    return summary


async def get_top_languages(db: AsyncIOMotorDatabase) -> List[Dict]:
    pipeline = [
        {"$group": {"_id": "$language", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}
    ]
    cursor = db.usage_stats.aggregate(pipeline)
    result = []
    async for doc in cursor:
        result.append(doc)
    logger.info("Top languages stats fetched")
    return result


async def get_image_categories_stats(db: AsyncIOMotorDatabase) -> List[Dict]:
    pipeline = [
        {"$group": {"_id": "$image_class", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    cursor = db.usage_stats.aggregate(pipeline)
    result = []
    async for doc in cursor:
        result.append(doc)
    logger.info("Image categories stats fetched")
    return result
