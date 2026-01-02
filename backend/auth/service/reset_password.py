import logging
import random
import string
from datetime import datetime, timedelta
from passlib.hash import bcrypt
from fastapi import HTTPException
from ..utils.email_utils.reset_email_sender import send_reset_email
from .password_utils import validate_password

logger = logging.getLogger("auth_service.reset_password")

OTP_EXPIRATION_MINUTES = 10  # กำหนด OTP หมดอายุ 10 นาที

async def request_reset_password_otp(email: str, db):
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="ไม่พบอีเมลนี้ในระบบ")

    record = await db.email_verifications.find_one({"email": email, "type": "reset_password"})
    if record:
        last_sent_at = record.get("last_sent_at")
        if last_sent_at and datetime.utcnow() - last_sent_at < timedelta(minutes=1):
            remaining = 60 - int((datetime.utcnow() - last_sent_at).total_seconds())
            raise HTTPException(status_code=429, detail=f"กรุณารอ {remaining} วินาทีก่อนขอ OTP ใหม่")
        # ลบ OTP เก่าก่อนส่งใหม่
        await db.email_verifications.delete_one({"email": email, "type": "reset_password"})

    otp = ''.join(random.choices(string.digits, k=6))
    now = datetime.utcnow()
    await db.email_verifications.insert_one({
        "email": email,
        "otp": otp,
        "type": "reset_password",
        "created_at": now,
        "last_sent_at": now,
    })

    try:
        await send_reset_email(email, otp)
    except Exception as e:
        logger.error(f"Failed to send reset OTP: {e}")
        raise HTTPException(status_code=500, detail="ส่ง OTP ไม่สำเร็จ กรุณาลองใหม่")

    return {"msg": "ส่ง OTP สำเร็จ กรุณาตรวจสอบอีเมล"}


async def verify_reset_password_otp(email: str, otp: str, db):
    record = await db.email_verifications.find_one({"email": email, "type": "reset_password"})
    if not record:
        raise HTTPException(status_code=404, detail="ไม่พบคำขอยืนยัน OTP")

    created_at = record.get("created_at")
    if created_at is None or (datetime.utcnow() - created_at) > timedelta(minutes=OTP_EXPIRATION_MINUTES):
        await db.email_verifications.delete_one({"email": email, "type": "reset_password"})
        raise HTTPException(status_code=400, detail="OTP หมดอายุ กรุณาขอ OTP ใหม่")

    if record.get("otp") != otp:
        raise HTTPException(status_code=400, detail="OTP ไม่ถูกต้อง")

    # ไม่ลบ OTP ที่นี่ ให้ลบตอน reset_password สำเร็จแทน
    return {"msg": "ยืนยัน OTP สำเร็จ"}


async def reset_password(email: str, new_password: str, otp: str, db):
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้")

    record = await db.email_verifications.find_one({"email": email, "type": "reset_password"})
    if not record:
        raise HTTPException(status_code=404, detail="ไม่พบคำขอยืนยัน OTP")

    created_at = record.get("created_at")
    if created_at is None or (datetime.utcnow() - created_at) > timedelta(minutes=OTP_EXPIRATION_MINUTES):
        await db.email_verifications.delete_one({"email": email, "type": "reset_password"})
        raise HTTPException(status_code=400, detail="OTP หมดอายุ กรุณาขอ OTP ใหม่")

    if record.get("otp") != otp:
        raise HTTPException(status_code=400, detail="OTP ไม่ถูกต้อง")

    if not validate_password(new_password):
        raise HTTPException(
            status_code=400,
            detail="รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร และประกอบด้วย ตัวเลข ตัวพิมพ์ใหญ่ ตัวพิมพ์เล็ก และอักขระพิเศษ"
        )

    if bcrypt.verify(new_password, user["hashed_password"]):
        raise HTTPException(
            status_code=400,
            detail="รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม"
        )

    hashed = bcrypt.hash(new_password)
    await db.users.update_one(
        {"email": email},
        {"$set": {"hashed_password": hashed, "updated_at": datetime.utcnow()}}
    )

    # ลบ OTP หลัง reset password สำเร็จ
    await db.email_verifications.delete_one({"email": email, "type": "reset_password"})

    return {"msg": "รีเซ็ตรหัสผ่านสำเร็จ"}
