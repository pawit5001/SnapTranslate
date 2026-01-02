from fastapi import APIRouter, UploadFile, Form, HTTPException, File, Depends, Security
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.services.blip_service import describe_image
from backend.services.yolo_service import detect_object
from backend.services.translate import translate_text
from backend.services.tts import generate_tts
from backend.config.languages import languages
from backend.services.admin_service import record_usage_stat
from backend.models.admin_models import UsageStat
from backend.database import get_db  # ปรับตามที่เก็บจริง
from jose import jwt, JWTError
from PIL import Image
import io
import json
import logging
import os
from typing import List

router = APIRouter()
logger = logging.getLogger("analyze_image")

security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"


async def get_current_user_email(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> str:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return email
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/")
async def analyze_image(
    image: UploadFile = File(...),
    mode: str = Form(...),
    langs: str = Form(...),
    db=Depends(get_db),
    user_email: str = Depends(get_current_user_email),
):
    try:
        # อ่านไฟล์ภาพ
        img_bytes = await image.read()
        if not img_bytes:
            raise HTTPException(status_code=400, detail="ไม่ได้รับไฟล์ภาพ")

        image_pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")

        # แปลง langs จาก JSON string → list
        try:
            langs_list: List[str] = json.loads(langs)
            if not isinstance(langs_list, list):
                raise ValueError("langs ต้องเป็น list ของชื่อภาษา")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"รูปแบบข้อมูลภาษาไม่ถูกต้อง: {str(e)}")

        # วิเคราะห์ภาพ
        if "object" in mode.lower():
            label = detect_object(image_pil)
            if not label:
                raise HTTPException(status_code=400, detail="ไม่พบวัตถุเด่นในภาพ")
            detected_image_class = "living" if any(keyword in label.lower() for keyword in ["animal", "human", "bird", "fish", "insect", "cat", "dog"]) else "non-living"
        else:
            label = describe_image(image_pil)
            detected_image_class = "living" if any(keyword in label.lower() for keyword in ["animal", "human", "bird", "fish", "insect", "cat", "dog"]) else "non-living"

        logger.info(f"Detected image class: {detected_image_class}")

        # แปลภาษาไทย + TTS
        th_text = translate_text(label, "th")
        th_audio_url = generate_tts(th_text, "th")

        result = {
            "original": label,
            "th": th_text,
            "audio_url": th_audio_url,
            "translations": []
        }

        # แปลภาษาอื่น ๆ และ TTS
        for lang in langs_list:
            lang_code = languages.get(lang)
            if not lang_code:
                logger.warning(f"ไม่พบรหัสภาษาสำหรับ: {lang}")
                continue
            try:
                translated = translate_text(label, lang_code)
                audio_url = generate_tts(translated, lang_code)
                result["translations"].append({
                    "language": lang,
                    "translated": translated,
                    "audio_url": audio_url
                })
            except Exception as e:
                logger.error(f"แปลภาษา {lang} ไม่สำเร็จ: {e}")
                continue

        # บันทึกสถิติการใช้งาน
        usage_stat = UsageStat(
            user_email=user_email,
            language="th",  # สามารถปรับเป็น target language ตัวแรกของ langs_list
            image_class=detected_image_class,
            count=1
        )
        await record_usage_stat(db, usage_stat)

        return result

    except HTTPException as he:
        logger.error(f"HTTPException: {he.detail}")
        raise he
    except Exception as e:
        logger.error(f"Exception: {e}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": "Internal Server Error"})
