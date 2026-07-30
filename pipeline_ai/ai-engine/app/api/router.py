from fastapi import APIRouter
from app.api.endpoints import ocr, intent, ner, sql, evaluator

api_router = APIRouter()

api_router.include_router(ocr.router, tags=["OCR Services"])
api_router.include_router(intent.router, tags=["Intent Services"])
api_router.include_router(ner.router, tags=["NER Services"])
api_router.include_router(sql.router, tags=["Text-to-SQL Services"])
api_router.include_router(evaluator.router, tags=["Self-Evaluation Services"])
