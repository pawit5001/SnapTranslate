import logging
from datetime import datetime, timedelta
from passlib.hash import bcrypt
from fastapi import HTTPException
from ..utils.otp_utils import generate_otp
from ..utils.email_utils.verify_email_sender import send_verification_email

logger = logging.getLogger("auth_service.register")

OTP_EXPIRATION_MINUTES = 10  # กำหนดอายุ OTP 10 นาที

async def register_user(user, db):
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="อีเมลนี้มีผู้ใช้งานแล้ว")
    if await db.users.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="ชื่อผู้ใช้นี้มีผู้ใช้งานแล้ว")

    # ลบ OTP เก่าที่ค้างอยู่ก่อน เพื่อไม่ให้เกิด error "มีคำขอยืนยันอีเมลนี้อยู่แล้ว"
    await db.email_verifications.delete_many({"email": user.email, "type": "register"})

    otp = generate_otp()
    now = datetime.utcnow()
    await db.email_verifications.insert_one({
        "email": user.email,
        "username": user.username,
        "hashed_password": bcrypt.hash(user.password),
        "otp": otp,
        "type": "register",
        "created_at": now,
        "last_sent_at": now,
    })

    try:
        await send_verification_email(user.email, otp)
    except Exception as e:
        logger.error(f"Failed to send OTP email: {e}")

    return {"msg": "สมัครสำเร็จ กรุณายืนยัน OTP ทางอีเมล"}

# ฟังก์ชัน verify_email ควรแก้เพื่อเช็คอายุ OTP ด้วย

async def verify_email(email: str, otp: str, db):
    record = await db.email_verifications.find_one({"email": email, "type": "register"})
    if not record:
        raise HTTPException(status_code=404, detail="ไม่พบคำขอยืนยันอีเมลนี้")

    # เช็ค OTP หมดอายุ
    created_at = record.get("created_at")
    if created_at is None or (datetime.utcnow() - created_at) > timedelta(minutes=OTP_EXPIRATION_MINUTES):
        # ลบ record OTP หมดอายุ
        await db.email_verifications.delete_one({"email": email, "type": "register"})
        raise HTTPException(status_code=400, detail="OTP หมดอายุ กรุณาขอ OTP ใหม่")

    if record.get("otp") != otp:
        logger.warning(f"Incorrect registration OTP attempt for {email}: received {otp}, expected {record.get('otp')}")
        raise HTTPException(status_code=400, detail="OTP ไม่ถูกต้อง")

    logger.info(f"Correct registration OTP verified for {email}: {otp}")

    user_doc = {
        "username": record["username"],
        "email": record["email"],
        "hashed_password": record["hashed_password"],
        "is_verified": True,
        "role": "ผู้ใช้",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
    await db.users.insert_one(user_doc)
    await db.email_verifications.delete_one({"email": email, "type": "register"})

    from uuid import uuid4
    from ..utils.token_utils import create_access_token, create_refresh_token

    access_token = create_access_token({"sub": email})
    refresh_jti = str(uuid4())
    refresh_token = create_refresh_token({"sub": email, "jti": refresh_jti})

    await db.refresh_tokens.insert_one({"jti": refresh_jti, "user": email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
