# backend/routes/stats.py
from fastapi import APIRouter, Depends, HTTPException
from backend.auth.auth_utils import verify_admin_user
from backend.services.stats_service import get_top_languages, get_image_categories_stats
from backend.services.admin_service import get_usage_stats_summary
import logging

router = APIRouter()
logger = logging.getLogger("stats_routes")


@router.get("/usage-summary")
async def usage_stats_summary(admin=Depends(verify_admin_user)):
    try:
        stats = await get_usage_stats_summary(admin["db"])
        return {"usage_summary": stats}
    except Exception as e:
        logger.error(f"Failed to get usage stats summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to get usage stats summary")


@router.get("/top-languages")
async def top_languages_stats(admin=Depends(verify_admin_user)):
    try:
        stats = await get_top_languages()
        return {"top_languages": stats}
    except Exception as e:
        logger.error(f"Failed to get top languages stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get top languages stats")


@router.get("/image-categories")
async def image_categories_stats(admin=Depends(verify_admin_user)):
    try:
        stats = await get_image_categories_stats()
        return {"image_categories": stats}
    except Exception as e:
        logger.error(f"Failed to get image categories stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get image categories stats")
