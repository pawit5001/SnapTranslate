from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from backend.services.feedback_service import save_feedback, get_feedback_stats
from backend.database import get_db
from uuid import uuid4
from motor.motor_asyncio import AsyncIOMotorDatabase
import httpx

router = APIRouter()

class FeedbackRequest(BaseModel):
    feedback: str  # "up" หรือ "down"
    translation_id: str
    original_text: str = None

async def get_current_user_via_profile(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient() as client:
        res = await client.get("http://localhost:8000/auth/profile", headers=headers)
        if res.status_code != 200:
            return None
        return res.json()

@router.post("/")
async def submit_feedback(
    data: FeedbackRequest,
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    auth: str = request.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = auth.split(" ")[1]

    current_user = await get_current_user_via_profile(token)
    if not current_user or not current_user.get("email"):
        raise HTTPException(status_code=400, detail="Cannot get user email")
    user_email = current_user.get("email")

    feedback_data = {
        "user_email": user_email,
        "feedback": data.feedback,
        "translation_id": data.translation_id,
        "original_text": data.original_text,
    }

    result = await save_feedback(db=db, feedback=feedback_data)
    return {"message": f"{result} feedback", "status": result}

@router.get("/stats")
async def feedback_stats(
    translation_id: str = None,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    stats = await get_feedback_stats(db=db, translation_id=translation_id)
    return {"feedback_stats": stats}
