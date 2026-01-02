from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class FeedbackCreate(BaseModel):
    translation_id: str
    positive: bool

class FeedbackInDB(BaseModel):
    id: Optional[str] = Field(alias="_id")
    user_id: str
    translation_id: str
    positive: bool
    created_at: datetime
