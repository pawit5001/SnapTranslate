import logging
import random
import string
from datetime import datetime, timedelta
from uuid import uuid4
from fastapi import HTTPException
from ..utils.token_utils import create_access_token, create_refresh_token
from ..utils.email_utils.verify_email_sender import send_verification_email

logger = logging.getLogger("auth_service.verify_email")

async def verify_email(email: str, otp: str, db):
    # หา record ด้วย type: register (ตามข้อมูลที่เก็บจริง)
    record = await db.email_verifications.find_one({"email": email, "type": "register"})
    if not record:
        raise HTTPException(status_code=404, detail="ไม่พบคำขอยืนยันอีเมลนี้")

    if record.get("otp") != otp:
        raise HTTPException(status_code=400, detail="OTP ไม่ถูกต้อง")

    # ตัวอย่างสร้าง user ใหม่ (ถ้าจำเป็น)
    user_doc = {
        "username": record.get("username", ""),  # ถ้าต้องเก็บ username ใน request_verify_email_otp ด้วย
        "email": record["email"],
        "hashed_password": record.get("hashed_password", ""),  # ปรับตามการเก็บรหัสผ่านจริง
        "is_verified": True,
        "role": "ผู้ใช้",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    # ตรวจสอบก่อน insert เพื่อป้องกัน user ซ้ำ
    existing_user = await db.users.find_one({"email": email})
    if not existing_user:
        await db.users.insert_one(user_doc)
    else:
        # ถ้า user มีอยู่แล้ว อัปเดตสถานะ verified
        await db.users.update_one({"email": email}, {"$set": {"is_verified": True, "updated_at": datetime.utcnow()}})

    # ลบ record otp ทิ้งหลังยืนยัน โดยลบ type: register
    await db.email_verifications.delete_one({"email": email, "type": "register"})

    access_token = create_access_token({"sub": email})
    refresh_jti = str(uuid4())
    refresh_token = create_refresh_token({"sub": email, "jti": refresh_jti})

    await db.refresh_tokens.insert_one({"jti": refresh_jti, "user": email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


async def request_verify_email_otp(email: str, db):
    user_exists = await db.users.find_one({"email": email})
    if user_exists:
        raise HTTPException(status_code=400, detail="อีเมลนี้ถูกใช้งานแล้ว")

    record = await db.email_verifications.find_one({"email": email, "type": "register"})
    if record:
        last_sent_at = record.get("last_sent_at")
        if last_sent_at and datetime.utcnow() - last_sent_at < timedelta(minutes=1):
            remaining = 60 - int((datetime.utcnow() - last_sent_at).total_seconds())
            raise HTTPException(status_code=429, detail=f"กรุณารอ {remaining} วินาทีก่อนขอ OTP ใหม่")

    otp = ''.join(random.choices(string.digits, k=6))
    now = datetime.utcnow()

    # อัปเดตหรือสร้างใหม่แทนลบแล้วเพิ่มใหม่ (type=register)
    result = await db.email_verifications.update_one(
        {"email": email, "type": "register"},
        {"$set": {"otp": otp, "last_sent_at": now, "created_at": now}},
        upsert=True,
    )
    logger.info(f"ส่ง OTP {otp} ไปยังอีเมล {email}")

    try:
        await send_verification_email(email, otp)
    except Exception as e:
        logger.error(f"Failed to send verify email OTP: {e}")
        raise HTTPException(status_code=500, detail="ส่ง OTP ยืนยันอีเมลไม่สำเร็จ กรุณาลองใหม่")

    return {"msg": "ส่ง OTP ยืนยันอีเมลเรียบร้อยแล้ว กรุณาตรวจสอบอีเมล"}
