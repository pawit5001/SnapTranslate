from fastapi import APIRouter, Depends, HTTPException, Query, Security, Response, Request
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorClient
from fastapi.security import OAuth2PasswordRequestForm, HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError
from uuid import uuid4
from datetime import datetime
from pydantic import BaseModel, EmailStr
import os
import logging
from dotenv import load_dotenv

from .service.register import register_user
from .service.login import login_user
from .service.verify_email import verify_email, request_verify_email_otp
from .service.reset_password import (
    request_reset_password_otp,
    verify_reset_password_otp,
    reset_password,
)
from .service.password_utils import validate_password
from backend.auth.models import (
    UserRegister,
    TokenResponse,
    RefreshTokenRequest,
    VerifyEmailRequest,
)
from backend.auth.auth_utils import (
    REFRESH_SECRET_KEY,
    SECRET_KEY,
    create_access_token,
    create_refresh_token,
    verify_password,
)

load_dotenv()

router = APIRouter(tags=["auth"])

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URI)
db = client["snaptranslate"]

def get_db() -> AsyncIOMotorDatabase:
    return db

security = HTTPBearer()
logger = logging.getLogger("auth_routes")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# --- Models ---
class CheckOldPasswordRequest(BaseModel):
    email: EmailStr
    old_password: str

class CheckOldPasswordResponse(BaseModel):
    valid: bool

class VerifyEmailOtpRequest(BaseModel):
    email: EmailStr

class ResetPasswordOtpRequest(BaseModel):
    email: EmailStr

class VerifyResetPasswordOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str
    otp: str

# -------------------- Auth Endpoints --------------------

@router.post("/check-availability")
async def check_availability(
    field: str = Query(..., regex="^(email|username)$"),
    value: str = Query(...),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    exists = await db.users.find_one({field: value})
    return {"available": exists is None}

@router.post("/register")
async def register(user: UserRegister, db: AsyncIOMotorDatabase = Depends(get_db)):
    return await register_user(user, db)

@router.post("/verify-email", response_model=TokenResponse)
async def verify_email_route(
    data: VerifyEmailRequest, db: AsyncIOMotorDatabase = Depends(get_db)
):
    return await verify_email(data.email, data.otp, db)

@router.post("/login", response_model=TokenResponse)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    # เรียก login_user พร้อม response (แก้ไขตรงนี้)
    result = await login_user(form_data, db, response)
    return {
        "access_token": result["access_token"],
        "refresh_token": "sent_in_cookie",
        "token_type": "bearer"
    }

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_route(
    request: Request,
    response: Response,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    refresh_token_cookie = request.cookies.get("refresh_token")
    if not refresh_token_cookie:
        raise HTTPException(status_code=401, detail="No refresh token cookie found")
    try:
        payload = jwt.decode(refresh_token_cookie, REFRESH_SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        jti = payload.get("jti")
        if not await db.refresh_tokens.find_one({"jti": jti}):
            raise HTTPException(status_code=401, detail="Refresh token invalid or used")

        new_jti = str(uuid4())
        sub = payload.get("sub")
        new_access = create_access_token({"sub": sub})
        new_refresh = create_refresh_token({"sub": sub, "jti": new_jti})

        # update DB
        await db.refresh_tokens.insert_one({"jti": new_jti, "user": sub, "created_at": datetime.utcnow()})
        await db.refresh_tokens.delete_one({"jti": jti})

        # update cookie
        response.set_cookie(
            key="refresh_token",
            value=new_refresh,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=7*24*60*60
        )
        return {"access_token": new_access, "token_type": "bearer"}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post("/logout")
async def logout(response: Response, request: Request, db: AsyncIOMotorDatabase = Depends(get_db)):
    refresh_token_cookie = request.cookies.get("refresh_token")
    if refresh_token_cookie:
        try:
            payload = jwt.decode(refresh_token_cookie, REFRESH_SECRET_KEY, algorithms=["HS256"])
            jti = payload.get("jti")
            await db.refresh_tokens.delete_one({"jti": jti})
        except JWTError:
            pass
    response.delete_cookie("refresh_token")
    return {"message": "Logged out"}

# -------------------- Profile --------------------

@router.get("/profile")
async def get_profile(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.users.find_one({"email": email}, {"hashed_password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["id"] = str(user["_id"])
    user.pop("_id", None)
    return user

# -------------------- Password / Email OTP --------------------

@router.post("/request-verify-email-otp")
async def request_verify_email_otp_route(
    data: VerifyEmailOtpRequest, db: AsyncIOMotorDatabase = Depends(get_db)
):
    return await request_verify_email_otp(data.email, db)

@router.post("/request-reset-password-otp")
async def request_reset_password_otp_route(
    data: ResetPasswordOtpRequest, db: AsyncIOMotorDatabase = Depends(get_db)
):
    return await request_reset_password_otp(data.email, db)

@router.post("/verify-reset-password-otp")
async def verify_reset_password_otp_route(
    data: VerifyResetPasswordOtpRequest, db: AsyncIOMotorDatabase = Depends(get_db)
):
    return await verify_reset_password_otp(data.email, data.otp, db)

@router.post("/reset-password")
async def reset_password_route(
    data: ResetPasswordRequest, db: AsyncIOMotorDatabase = Depends(get_db)
):
    return await reset_password(data.email, data.new_password, data.otp, db)

# --- Check old password ---

@router.post("/check-old-password", response_model=CheckOldPasswordResponse)
async def check_old_password_route(
    data: CheckOldPasswordRequest, db: AsyncIOMotorDatabase = Depends(get_db)
):
    user = await db.users.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    hashed_password = user.get("hashed_password")
    if not hashed_password:
        raise HTTPException(status_code=500, detail="Password data corrupted")
    is_valid = verify_password(data.old_password, hashed_password)
    return CheckOldPasswordResponse(valid=is_valid)
