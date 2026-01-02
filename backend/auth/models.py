from typing import Optional, List
from pydantic import BaseModel, EmailStr, HttpUrl
from datetime import datetime

# --- Existing schemas ---

class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    otp: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str

class ResetPasswordOtpRequest(BaseModel):
    email: EmailStr

class VerifyResetPasswordOtpRequest(BaseModel):
    email: EmailStr
    otp: str

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str
    otp: str

class RequestVerifyEmailOtpRequest(BaseModel):
    email: EmailStr


# --- New schemas for admin features ---

class FeedbackRequest(BaseModel):
    user_email: EmailStr
    translation_id: str  # อาจเป็น id ของการแปลใน DB
    feedback: str  # "up" หรือ "down"
    timestamp: Optional[datetime] = None


class WebhookSetting(BaseModel):
    discord_webhook_url: HttpUrl


class UsageStat(BaseModel):
    user_email: EmailStr
    language: str
    image_class: str  # เช่น 'living' หรือ 'non-living'
    count: int
    last_used: Optional[datetime] = None


class AdminUserUpdateRequest(BaseModel):
    email: EmailStr
    is_banned: Optional[bool] = False
    roles: Optional[List[str]] = []


class ChangePasswordRequest(BaseModel):
    email: EmailStr
    old_password: str
    new_password: str


class UpdateUserSettingsRequest(BaseModel):
    email: EmailStr
    dark_mode_enabled: Optional[bool] = False
