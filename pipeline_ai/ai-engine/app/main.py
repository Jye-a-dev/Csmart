from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.config import settings
from app.api.router import api_router
from app.services.model_loader import model_loader
from app.services.text_to_sql import vitext2sql_service
from app.services.database import db_service

import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Kích hoạt Singleton ModelLoader nạp model sẵn vào memory khi khởi động
    model_loader.load_models()
    # Nạp dữ liệu ViText2SQL vào memory
    vitext2sql_service.load_dataset()
    # Kết nối cơ sở dữ liệu PostgreSQL
    await db_service.connect()
    
    # In link Swagger ra console khi server chạy thành công
    port = os.getenv("PORT", "8000")
    print(f"\n[FastAPI] Swagger UI: http://127.0.0.1:{port}/docs\n")
    yield
    # Ngắt kết nối cơ sở dữ liệu PostgreSQL
    await db_service.disconnect()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Đăng ký Router với tiền tố /api/v1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION
    }