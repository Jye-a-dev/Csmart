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
    # Nạp model embeddings
    from app.services.embedding import embedding_service
    embedding_service.load_model()
    # Nạp dữ liệu ViText2SQL vào memory
    vitext2sql_service.load_dataset()
    # Kết nối cơ sở dữ liệu PostgreSQL
    await db_service.connect()
    
    # Trình backfill vector embeddings bất đồng bộ cho sản phẩm chưa có vector
    from app.services.hybrid_search import hybrid_search_service
    import asyncio
    asyncio.create_task(hybrid_search_service.backfill_embeddings())

    # In link Swagger ra console khi server chạy thành công
    port = os.getenv("PORT", "8000")
    print(f"\n[FastAPI] Swagger UI: http://127.0.0.1:{port}/docs\n")
    yield
    # Ngắt kết nối cơ sở dữ liệu PostgreSQL
    await db_service.disconnect()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    docs_url="/docs",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Cấu hình CORS Middleware cho phép mọi Origin truy cập
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
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