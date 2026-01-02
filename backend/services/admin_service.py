# backend/services/admin_service.py
import logging
from typing import Optional, List, Dict, Any, Tuple
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from backend.models.admin_models import UsageStat

logger = logging.getLogger("admin_service")


async def update_user(db: AsyncIOMotorDatabase, email: str,
                      is_banned: Optional[bool], roles: Optional[List[str]]) -> bool:
    update_data: Dict[str, Any] = {}
    if is_banned is not None:
        update_data["is_banned"] = is_banned
    if roles is not None:
        if not isinstance(roles, list):
            logger.error("Roles must be a list")
            return False
        logger.info(f"Updating roles for {email}: {roles}")
        update_data["roles"] = roles

    if not update_data:
        logger.warning(f"No fields to update for {email}")
        return False

    result = await db.users.update_one({"email": email}, {"$set": update_data})
    if result.matched_count == 0:
        logger.warning(f"User not found: {email}")
        return False

    logger.info(f"Updated user {email} with {update_data}")
    return True


async def change_password(db: AsyncIOMotorDatabase, email: str,
                          old_password: str, new_password: str,
                          verify_password_func, hash_password_func) -> Tuple[bool, str]:
    user = await db.users.find_one({"email": email})
    if not user:
        return False, "User not found"
    if not verify_password_func(old_password, user.get("hashed_password", "")):
        return False, "Old password incorrect"
    new_hashed = hash_password_func(new_password)
    await db.users.update_one({"email": email}, {"$set": {"hashed_password": new_hashed}})
    logger.info(f"Password changed for {email}")
    return True, "Password updated successfully"


async def update_user_settings(db: AsyncIOMotorDatabase, email: str,
                               dark_mode_enabled: Optional[bool]) -> bool:
    update_data: Dict[str, Any] = {}
    if dark_mode_enabled is not None:
        update_data["dark_mode_enabled"] = dark_mode_enabled

    if not update_data:
        return False

    result = await db.users.update_one({"email": email}, {"$set": update_data})
    logger.info(f"Updated settings for {email}")
    return result.matched_count > 0


async def get_users_list(db: AsyncIOMotorDatabase, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
    cursor = db.users.find({}, {"hashed_password": 0}).skip(skip).limit(limit)
    users = await cursor.to_list(length=limit)
    for u in users:
        if isinstance(u.get("_id"), ObjectId):
            u["_id"] = str(u["_id"])
    return users


async def record_usage_stat(db: AsyncIOMotorDatabase, stat: UsageStat) -> None:
    logger.info(f"Recording usage stat: user_email={stat.user_email}, language={stat.language}, image_class={stat.image_class}, count={stat.count}")

    existing = await db.usage_stats.find_one({
        "user_email": stat.user_email,
        "language": stat.language,
        "image_class": stat.image_class
    })
    if existing:
        logger.info(f"Updating existing usage stat for user_email={stat.user_email}, image_class={stat.image_class}")
        await db.usage_stats.update_one(
            {"_id": existing["_id"]},
            {"$inc": {"count": stat.count}, "$set": {"last_used": datetime.utcnow()}}
        )
    else:
        logger.info(f"Inserting new usage stat for user_email={stat.user_email}, image_class={stat.image_class}")
        data = stat.dict()
        if not data.get("last_used"):
            data["last_used"] = datetime.utcnow()
        await db.usage_stats.insert_one(data)


async def get_usage_stats_summary(db: AsyncIOMotorDatabase) -> List[Dict[str, Any]]:
    pipeline = [{"$group": {"_id": "$user_email", "total_count": {"$sum": "$count"}, "last_used": {"$max": "$last_used"}}}]
    cursor = db.usage_stats.aggregate(pipeline)
    summary = []
    async for doc in cursor:
        summary.append({"user_email": doc["_id"], "total_count": doc["total_count"], "last_used": doc.get("last_used")})
    return summary
