from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from backend.auth.models import (
    ResetPasswordOtpRequest,
    VerifyResetPasswordOtpRequest,
    ResetPasswordRequest,
)
from backend.auth.service.reset_password import (
    request_reset_password_otp,
    verify_reset_password_otp,
    reset_password,
)
from backend.auth.routes.auth_routes import get_db  # ใช้ get_db เดียวกัน

router = APIRouter()


@router.post("/request-reset-password-otp")
async def request_reset_password_otp_route(data: ResetPasswordOtpRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    logging.info(f"request-reset-password-otp called for email={data.email}")
    result = await request_reset_password_otp(data.email, db)
    logging.info(f"request-reset-password-otp result: {result}")
    return result


@router.post("/verify-reset-password-otp")
async def verify_reset_password_otp_route(data: VerifyResetPasswordOtpRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    logging.info(f"verify-reset-password-otp called for email={data.email}, otp={data.otp}")
    result = await verify_reset_password_otp(data.email, data.otp, db)
    logging.info(f"verify-reset-password-otp result: {result}")
    return result


@router.post("/reset-password")
async def reset_password_route(data: ResetPasswordRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    logging.info(f"reset-password called for email={data.email}")
    result = await reset_password(data.email, data.new_password, data.otp, db)
    logging.info(f"reset-password result: {result}")
    return result
