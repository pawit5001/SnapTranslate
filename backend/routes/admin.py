import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel

from backend.auth.auth_utils import verify_admin_user, verify_password, hash_password
from backend.services.admin_service import (
    update_user,
    change_password,
    update_user_settings,
    get_users_list,
)
from backend.services.discord_webhook_service import get_webhook, update_webhook
from backend.models.admin_models import (
    AdminUserUpdateRequest,
    ChangePasswordRequest,
    WebhookSetting,
    UpdateUserSettingsRequest,
    MessageResponse,
)

# -----------------------------
# Logger setup
# -----------------------------
logger = logging.getLogger("admin_route")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

router = APIRouter()


class WebhookRequest(BaseModel):
    discord_webhook_url: str  # Relaxed validation to accept any string


# -----------------------------
# Dashboard summary
# -----------------------------
@router.get("/dashboard-summary")
async def get_dashboard_summary(admin=Depends(verify_admin_user)):
    db: AsyncIOMotorDatabase = admin["db"]

    # Users
    total_users = await db.users.count_documents({})
    logger.info(f"Total users: {total_users}")

    # Feedback
    up_feedback = await db.feedback.count_documents({"feedback": "up"})
    down_feedback = await db.feedback.count_documents({"feedback": "down"})
    logger.info(f"Feedback - up: {up_feedback}, down: {down_feedback}")

    # Usage Stats
    pipeline = [{"$group": {"_id": "$image_class", "total": {"$sum": "$count"}}}]
    results = await db.usage_stats.aggregate(pipeline).to_list(length=None)
    logger.info(f"Usage stats aggregation results: {results}")

    living_count = 0
    nonliving_count = 0
    for r in results:
        if r["_id"] == "living":
            living_count = r["total"]
        elif r["_id"] == "non-living":  # Corrected key to match aggregation result
            nonliving_count = r["total"]

    # Ensure total_translations includes both living and non-living counts
    total_translations = living_count + nonliving_count
    logger.info(f"Translations - Total: {total_translations}, Living: {living_count}, NonLiving: {nonliving_count}")

    return {
        "totalUsers": total_users,
        "feedback": {"up": up_feedback, "down": down_feedback},
        "translations": {
            "total": total_translations,
            "living": living_count,
            "nonLiving": nonliving_count,
        },
    }


# -----------------------------
# Update user info (ban, roles)
# -----------------------------
@router.post("/user/update", response_model=MessageResponse)
async def update_user_route(
    data: AdminUserUpdateRequest,
    admin=Depends(verify_admin_user),
):
    success = await update_user(
        db=admin["db"],
        email=data.email,
        is_banned=data.is_banned,
        roles=data.roles,
    )
    if not success:
        logger.warning(f"Failed to update user: {data.email}")
        raise HTTPException(status_code=404, detail="User not found")
    logger.info(f"User updated: {data.email}")
    return {"message": "User updated successfully"}


# -----------------------------
# Change user password
# -----------------------------
@router.post("/user/change-password", response_model=MessageResponse)
async def change_password_route(
    data: ChangePasswordRequest,
    admin=Depends(verify_admin_user),
):
    success, message = await change_password(
        db=admin["db"],
        email=data.email,
        old_password=data.old_password,
        new_password=data.new_password,
        verify_password_func=verify_password,
        hash_password_func=hash_password,
    )
    if not success:
        logger.warning(f"Password change failed for user: {data.email} - {message}")
        raise HTTPException(status_code=400, detail=message)
    logger.info(f"Password changed for user: {data.email}")
    return {"message": message}


# -----------------------------
# Save Discord webhook
# -----------------------------
@router.post("/save-webhook", response_model=MessageResponse)
async def save_webhook_route(
    data: WebhookRequest,
    admin=Depends(verify_admin_user),
):
    logger.info(f"Received webhook URL: {data.discord_webhook_url}")
    await update_webhook(admin["db"], data.discord_webhook_url)
    logger.info(f"Webhook saved: {data.discord_webhook_url}")
    return {"message": "Webhook URL saved successfully."}


# -----------------------------
# Retrieve Discord webhook
# -----------------------------
@router.get("/get-webhook", response_model=Optional[WebhookSetting])
async def get_webhook_route(admin=Depends(verify_admin_user)):
    logger.info("/get-webhook endpoint called")  # Changed from print to logger for consistency
    webhook = await get_webhook(admin["db"])
    if webhook is None:
        logger.info("No webhook configured")
        return None
    logger.info(f"Retrieved webhook: {webhook}")  # Log the full webhook object
    return WebhookSetting(discord_webhook_url=webhook["url"])


# -----------------------------
# Update user personal settings
# -----------------------------
@router.post("/user/settings", response_model=MessageResponse)
async def update_user_settings_route(
    data: UpdateUserSettingsRequest,
    admin=Depends(verify_admin_user),
):
    success = await update_user_settings(
        db=admin["db"],
        email=data.email,
        dark_mode_enabled=data.dark_mode_enabled,
    )
    if not success:
        logger.warning(f"Failed to update user settings: {data.email}")
        raise HTTPException(status_code=404, detail="User not found")
    logger.info(f"User settings updated: {data.email}")
    return {"message": "User settings updated successfully"}


# -----------------------------
# Get list of users
# -----------------------------
@router.get("/users")
async def get_users_route(
    skip: int = 0,
    limit: int = 50,
    admin=Depends(verify_admin_user),
):
    users = await get_users_list(admin["db"], skip=skip, limit=limit)
    logger.info(f"Retrieved {len(users)} users")
    return {"users": users, "count": len(users)}
