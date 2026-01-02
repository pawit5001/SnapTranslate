from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.routes import analyze, generate_image, languages, admin, feedback, stats
from backend.auth.routes import api_router as auth_router
import os
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "*"  # อนุญาตทุก origin ชั่วคราว
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("tts_cache", exist_ok=True)
app.mount("/audio", StaticFiles(directory="tts_cache"), name="audio")

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Register routers
app.include_router(analyze.router, prefix="/analyze", tags=["analyze"])
app.include_router(languages.router, prefix="/languages", tags=["languages"])
app.include_router(generate_image.router, prefix="/generate", tags=["generate"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(feedback.router, prefix="/feedback", tags=["feedback"])
app.include_router(stats.router, prefix="/stats", tags=["stats"])

logging.info("Registered routes:")
for route in app.routes:
    logging.info(route.path)