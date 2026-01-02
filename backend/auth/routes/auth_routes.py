import os
import logging
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, Security
from fastapi import Response
from fastapi.security import OAuth2PasswordRequestForm, HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from jose import jwt, JWTError

from backend.auth.models import UserRegister, TokenResponse, RefreshTokenRequest
from backend.auth.service.register import register_user
from backend.auth.service.login import login_user
from backend.auth.auth_utils import (
    REFRESH_SECRET_KEY,
    create_access_token,
    create_refresh_token,
    verify_password,
)

# Config environment variables
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
# REFRESH_SECRET_KEY มาจาก auth_utils

# Setup logging (เรียกก่อน getLogger)
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("auth_routes")

# สร้าง MongoDB client และ database object
client = AsyncIOMotorClient(MONGODB_URI)
db = client["snaptranslate"]

# Dependency สำหรับดึง db
def get_db() -> AsyncIOMotorDatabase:
    return db

router = APIRouter()
security = HTTPBearer()

@router.post("/check-availability")
async def check_availability(
    field: str = Query(..., regex="^(email|username)$"),
    value: str = Query(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    logger.info(f"check-availability called for field={field}, value={value}")
    exists = await db.users.find_one({field: value})
    available = exists is None
    logger.info(f"check-availability result: available={available}")
    return {"available": available}

@router.post("/register")
async def register(user: UserRegister, db: AsyncIOMotorDatabase = Depends(get_db)):
    logger.info(f"register called for email={user.email}, username={user.username}")
    result = await register_user(user, db)
    logger.info(f"register result: {result}")
    return result

@router.post("/login", response_model=TokenResponse)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    logger.info(f"login called for username={form_data.username}")
    result = await login_user(form_data, db, response) 
    logger.info(f"login success for username={form_data.username}")
    return {
        "access_token": result["access_token"],
        "refresh_token": "sent_in_cookie",
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    data: RefreshTokenRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    logger.info("refresh token called")
    try:
        payload = jwt.decode(data.refresh_token, REFRESH_SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "refresh":
            logger.warning("Invalid token type in refresh token")
            raise HTTPException(status_code=401, detail="Invalid token type")

        jti = payload.get("jti")
        if not await db.refresh_tokens.find_one({"jti": jti}):
            logger.warning(f"Refresh token jti={jti} not found in DB")
            raise HTTPException(status_code=401, detail="Refresh token ใช้ไม่ได้แล้ว")

        new_jti = str(uuid4())
        sub = payload.get("sub")
        new_access = create_access_token({"sub": sub})
        new_refresh = create_refresh_token({"sub": sub, "jti": new_jti})

        await db.refresh_tokens.insert_one({"jti": new_jti, "user": sub})
        await db.refresh_tokens.delete_one({"jti": jti})

        logger.info(f"Refresh token success for user={sub}")
        return TokenResponse(access_token=new_access, refresh_token=new_refresh)

    except jwt.ExpiredSignatureError:
        logger.error("Refresh token expired")
        raise HTTPException(status_code=401, detail="Refresh token หมดอายุ")
    except Exception as e:
        logger.error(f"Refresh token error: {e}")
        raise HTTPException(status_code=401, detail="Refresh token ไม่ถูกต้อง")

@router.get("/profile")
async def get_profile(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    token = credentials.credentials
    logger.info("get_profile called")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "access":
            logger.warning("Invalid token type in access token")
            raise HTTPException(status_code=401, detail="Invalid token type")
        email = payload.get("sub")
        if email is None:
            logger.warning("Invalid token payload: no sub")
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError:
        logger.error("Invalid token")
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.users.find_one({"email": email}, {"hashed_password": 0})
    if not user:
        logger.warning(f"User not found for email={email}")
        raise HTTPException(status_code=404, detail="User not found")

    user["id"] = str(user["_id"])
    user.pop("_id", None)

    logger.info(f"get_profile success for email={email}")
    return user
