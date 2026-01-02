from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, EmailStr
import logging

from backend.auth.auth_utils import verify_password
from backend.auth.routes.auth_routes import get_db  # ใช้ get_db เดียวกัน

router = APIRouter()


class CheckOldPasswordRequest(BaseModel):
    email: EmailStr
    old_password: str


class CheckOldPasswordResponse(BaseModel):
    valid: bool


@router.post("/check-old-password", response_model=CheckOldPasswordResponse)
async def check_old_password_route(data: CheckOldPasswordRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    logging.info(f"check-old-password called for email: {data.email}")
    user = await db.users.find_one({"email": data.email})
    if not user:
        logging.warning(f"User not found for email: {data.email}")
        raise HTTPException(status_code=404, detail="User not found")

    hashed_password = user.get("hashed_password")
    if not hashed_password:
        logging.error(f"No hashed_password field for user: {data.email}")
        raise HTTPException(status_code=500, detail="Password data corrupted")

    is_valid = verify_password(data.old_password, hashed_password)
    logging.info(f"check-old-password result for email {data.email}: {is_valid}")
    return CheckOldPasswordResponse(valid=is_valid)


@router.post("/check-availability")
async def check_availability(
    field: str = Query(..., regex="^(email|username)$"),
    value: str = Query(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    logging.info(f"check-availability called for field={field}, value={value}")
    exists = await db.users.find_one({field: value})
    available = exists is None
    logging.info(f"check-availability result: available={available}")
    return {"available": available}
