from fastapi import APIRouter, HTTPException, Depends, Security
from pydantic import BaseModel
from backend.services.generate_image import generate_image_from_text  # เรียกใช้ฟังก์ชันจริงจาก service
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"

security = HTTPBearer()

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

class GenerateImageRequest(BaseModel):
    prompt: str

@router.post("/image")
async def generate_image_route(
    data: GenerateImageRequest,
    token_data=Depends(verify_token)  # ตรวจสอบ token ก่อนเข้าใช้งาน
):
    if not data.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt is required")
    try:
        image_url = await generate_image_from_text(data.prompt)
        return {"image_url": image_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
