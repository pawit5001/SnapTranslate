import os
import logging
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from dotenv import load_dotenv
from backend.database import get_db
from motor.motor_asyncio import AsyncIOMotorDatabase

load_dotenv()

security = HTTPBearer()
logger = logging.getLogger("auth_utils")

SECRET_KEY = os.getenv("SECRET_KEY")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY")
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 1 วัน
REFRESH_TOKEN_EXPIRE_DAYS = 7  # 7 วัน

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

if not SECRET_KEY or not REFRESH_SECRET_KEY:
    raise RuntimeError("SECRET_KEY and REFRESH_SECRET_KEY must be set")


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    logger.info(f"Access token created for user/email: {data.get('email')}")
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    logger.info(f"Refresh token created for user/email: {data.get('email')}")
    return encoded_jwt


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


async def verify_admin_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Verify user is admin. Returns payload with email, roles, etc.
    """
    token = credentials.credentials
    logger.info(f"Verifying admin user, token starts with: {token[:10]}...")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        roles = payload.get("roles", [])
        logger.info(f"Token payload: {payload}")
        logger.info(f"Roles in token: {roles}")
        if "admin" not in roles:
            raise HTTPException(status_code=403, detail="Admin privileges required")
        payload["db"] = db  # inject db เข้า payload
        logger.info(f"Admin user verified: {payload.get('email')}")
        return payload
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Return current logged-in user payload (email, roles, etc.)
    """
    token = credentials.credentials
    logger.info(f"Getting current user from token: {token[:10]}...")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        payload["db"] = db
        logger.info(f"Current user: {payload.get('email')}")
        return payload
    except JWTError as e:
        logger.error(f"JWT decode error: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")
