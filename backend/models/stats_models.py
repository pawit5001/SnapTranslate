from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UsageLog(BaseModel):
    user_id: str
    action: str  # เช่น 'translate', 'generate_image', 'login', ฯลฯ
    metadata: dict  # ข้อมูลเสริม เช่น {'language': 'en', 'image_category': 'living'}
    timestamp: datetime


class LanguageUsageStat(BaseModel):
    language: str
    count: int


class ImageCategoryStat(BaseModel):
    image_category: str
    count: int


class UsageStatsSummary(BaseModel):
    language: str
    image_class: str
    total: int


class TopLanguageStat(BaseModel):
    language: str
    count: int


class ImageCategoryCount(BaseModel):
    category: str
    count: int
