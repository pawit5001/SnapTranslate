from typing import Optional, List
from pydantic import BaseModel, EmailStr, HttpUrl
from datetime import datetime

class WebhookSetting(BaseModel):
    """Model สำหรับตั้งค่า Discord Webhook"""
    discord_webhook_url: HttpUrl


class AdminUserUpdateRequest(BaseModel):
    """Request สำหรับอัปเดตสถานะผู้ใช้ (ban/roles)"""
    email: EmailStr
    is_banned: Optional[bool] = None
    roles: Optional[List[str]] = None


class ChangePasswordRequest(BaseModel):
    """Request สำหรับเปลี่ยนรหัสผ่านผู้ใช้"""
    email: EmailStr
    old_password: str
    new_password: str


class UpdateUserSettingsRequest(BaseModel):
    """Request สำหรับอัปเดต settings ของผู้ใช้"""
    email: EmailStr
    dark_mode_enabled: Optional[bool] = None


class FeedbackRequest(BaseModel):
    """Request สำหรับส่ง feedback การแปล"""
    user_email: EmailStr
    translation_id: str
    feedback: str  # "up" หรือ "down"
    timestamp: Optional[datetime] = None


class UsageStat(BaseModel):
    """Model สำหรับเก็บสถิติการใช้งานของผู้ใช้"""
    user_email: EmailStr
    language: str
    image_class: str  # 'living' หรือ 'non-living'
    count: int
    last_used: datetime = datetime.utcnow()


class MessageResponse(BaseModel):
    """Response สำหรับข้อความทั่วไป"""
    message: str
