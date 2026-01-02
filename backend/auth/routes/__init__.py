from fastapi import APIRouter

from .auth_routes import router as auth_router
from .verify_routes import router as verify_router
from .reset_password_routes import router as reset_router
from .check_routes import router as check_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(verify_router)
api_router.include_router(reset_router)
api_router.include_router(check_router)
