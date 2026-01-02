from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
import os

from backend.auth.models import VerifyEmailRequest, TokenResponse, RequestVerifyEmailOtpRequest
from backend.auth.service.verify_email import verify_email, request_verify_email_otp
from backend.auth.routes.auth_routes import get_db  # ใช้ get_db เดียวกัน

router = APIRouter()

@router.post("/verify-email", response_model=TokenResponse)
async def verify_email_route(data: VerifyEmailRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    logging.info(f"verify-email called for email={data.email}")
    result = await verify_email(data.email, data.otp, db)
    logging.info(f"verify-email result: token generated for {data.email}")
    return result

@router.post("/request-verify-email-otp")
async def request_verify_email_otp_route(data: RequestVerifyEmailOtpRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    logging.info(f"request-verify-email-otp called for email={data.email}")
    result = await request_verify_email_otp(data.email, db)
    logging.info(f"request-verify-email-otp result: {result}")
    return result
