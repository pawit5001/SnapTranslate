from fastapi import APIRouter
from backend.config.languages import languages

router = APIRouter()

@router.get("/")
def get_languages():
    return languages