import logging
from uuid import uuid4
from datetime import datetime
from passlib.hash import bcrypt
from fastapi import HTTPException, Response
from ..utils.token_utils import create_access_token, create_refresh_token

logger = logging.getLogger("auth_service.login")

async def login_user(form_data, db, response: Response):
    # หา user ตาม email หรือ username
    user = await db.users.find_one({
        "$or": [
            {"email": form_data.username},
            {"username": form_data.username}
        ]
    })
    if not user or not bcrypt.verify(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="อีเมล/ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง")

    # Fetch user roles from the database
    role = user.get("role")
    roles = [role] if role else []
    logger.info(f"Fetched roles for user {user['email']}: {roles}")
    if not roles:
        logger.warning(f"User {user['email']} has no roles assigned in the database.")

    # Create access token with roles
    access_token = create_access_token({"sub": user["email"]}, roles=roles)
    
    # สร้าง refresh token
    refresh_jti = str(uuid4())
    refresh_token = create_refresh_token({"sub": user["email"], "jti": refresh_jti})

    # เก็บ refresh token ลง DB
    await db.refresh_tokens.insert_one({
        "jti": refresh_jti,
        "user": user["email"],
        "created_at": datetime.utcnow()
    })

    # ตั้ง HttpOnly cookie สำหรับ refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=False,  # True ถ้าใช้ HTTPS
        max_age=7*24*60*60  # 7 วัน
    )

    logger.info(f"Login successful for user: {user['email']}")
    return {"access_token": access_token, "refresh_token": refresh_token}
