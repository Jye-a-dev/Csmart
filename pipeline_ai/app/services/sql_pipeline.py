import re
import logging
import asyncio
from abc import ABC, abstractmethod
from typing import List, Optional
from pydantic import BaseModel
from app.services.text_to_sql import vitext2sql_service
from app.services.database import db_service
from app.services.ai_core import ai_engine_core

logger = logging.getLogger(__name__)

class SQLPipelineContext(BaseModel):
    question: str
    generated_sql: Optional[str] = None
    confidence_score: float = 0.0
    flag_for_review: bool = True
    status: str = "success"
    error_message: Optional[str] = None
    few_shot_examples: Optional[str] = None

class SQLPipelineComponent(ABC):
    @abstractmethod
    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        pass

class DatasetMatchComponent(SQLPipelineComponent):
    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        if context.generated_sql:
            return context

        query, score = vitext2sql_service.translate_with_score(context.question)
        if score >= 0.15:
            context.generated_sql = query
            context.confidence_score = score
            
        return context

class FewShotRAGComponent(SQLPipelineComponent):
    def __init__(self, limit: int = 5):
        self.limit = limit

    async def get_few_shot_examples(self) -> str:
        if db_service.pool is None:
            logger.warning("Database pool is not initialized for FewShotRAGComponent.")
            return ""

        try:
            query = """
                SELECT input_text, corrected_label 
                FROM ai_review_queue 
                WHERE status IN ('LABELLED', 'APPROVED') 
                  AND corrected_label IS NOT NULL 
                  AND TRIM(corrected_label) != ''
                ORDER BY reviewed_at DESC NULLS LAST, created_at DESC 
                LIMIT $1;
            """
            rows = await db_service.fetch(query, self.limit)
            if not rows:
                return ""

            examples = "\nDưới đây là các câu truy vấn mẫu đã được duyệt bởi chuyên gia:\n"
            for row in rows:
                input_text = row["input_text"] or ""
                corrected_label = row["corrected_label"] or ""
                examples += f"- Input: {input_text}\n  Correct SQL: {corrected_label}\n"
            
            return examples
        except Exception as e:
            logger.error(f"Lỗi khi lấy few-shot examples từ ai_review_queue: {e}")
            return ""

    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                context.few_shot_examples = ""
            else:
                context.few_shot_examples = loop.run_until_complete(self.get_few_shot_examples())
        except Exception as e:
            logger.error(f"Lỗi FewShotRAGComponent process: {e}")
            context.few_shot_examples = ""
        return context

    async def process_async(self, context: SQLPipelineContext) -> SQLPipelineContext:
        context.few_shot_examples = await self.get_few_shot_examples()
        return context

class LLMGenerateComponent(SQLPipelineComponent):
    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        if context.generated_sql and context.confidence_score >= 0.70:
            return context

        few_shot = context.few_shot_examples or ""
        system_prompt = f"""
        Bạn là chuyên gia PostgreSQL của hệ thống CsmartAI.
        BẢNG THÔNG TIN SCHEMA CỦA DATABASE HIỆN TẠI (BẮT BUỘC CHỈ SỬ DỤNG CÁC BẢNG VÀ CỘT NÀY):
        - categories (id UUID, name VARCHAR, slug VARCHAR, description TEXT, parent_id UUID, image_url_1 VARCHAR, image_url_2 VARCHAR, created_at TIMESTAMP)
        - products (id UUID, sku VARCHAR, name VARCHAR, slug VARCHAR, category_id UUID, description TEXT, base_price DECIMAL, discount_price DECIMAL, stock_quantity INT, status VARCHAR, is_published BOOLEAN, tags JSONB, attributes JSONB, created_at TIMESTAMP, updated_at TIMESTAMP)
        - users (id UUID, full_name VARCHAR, email VARCHAR, phone VARCHAR, role VARCHAR, is_active BOOLEAN, avatar_url VARCHAR, last_login_at TIMESTAMP, created_at TIMESTAMP, updated_at TIMESTAMP)
        - user_addresses (id UUID, user_id UUID, recipient_name VARCHAR, phone VARCHAR, street_address VARCHAR, ward VARCHAR, district VARCHAR, city_province VARCHAR, is_default BOOLEAN, created_at TIMESTAMP)
        - orders (id UUID, order_code VARCHAR, user_id UUID, status VARCHAR, total_amount DECIMAL, shipping_fee DECIMAL, discount_amount DECIMAL, shipping_address TEXT, note TEXT, cancel_reason TEXT, created_at TIMESTAMP, updated_at TIMESTAMP)
        - order_items (id UUID, order_id UUID, product_id UUID, product_name VARCHAR, unit_price DECIMAL, quantity INT, subtotal DECIMAL, shipping_status VARCHAR, courier_name VARCHAR, tracking_number VARCHAR, estimated_delivery TIMESTAMP, delivered_at TIMESTAMP)
        - payments (id UUID, order_id UUID, payment_method VARCHAR, payment_status VARCHAR, transaction_code VARCHAR, amount DECIMAL, paid_at TIMESTAMP, created_at TIMESTAMP)
        - faqs (id UUID, topic VARCHAR, question TEXT, answer TEXT, is_active BOOLEAN, created_at TIMESTAMP)

        QUY TẮC BẮT BUỘC VỀ TÊN BẢNG VÀ CỘT:
        1. Bảng categories: Cột id (UUID), name (Tên danh mục).
        2. Bảng products: Liên kết với categories bằng `products.category_id = categories.id`.
        3. CHỈ SINH CÂU LỆNH SQL READ-ONLY (SELECT / WITH). Không sinh DDL/DML (DELETE, UPDATE, INSERT, DROP, ALTER).
        4. Với câu hỏi "Cho tôi số lượng danh mục và tên của nó": `SELECT count(*) as total_categories, string_agg(name, ', ') as category_names FROM categories;` hoặc `SELECT id, name FROM categories;`
        5. Với câu hỏi Có/Không (Yes/No questions): Ưu tiên sinh SQL dạng `SELECT EXISTS(...) AS answer` hoặc `SELECT COUNT(*) AS count ...` hoặc `SELECT 1 FROM ... WHERE ... LIMIT 1` để xác định câu trả lời Yes/No chính xác.
        {few_shot}
        Trả về định dạng JSON duy nhất:
        {{"generated_sql": "...", "confidence_score": 0.95, "flag_for_review": false}}
        """

        result = ai_engine_core._call_llm(system_prompt, context.question)
        if result.get("status") == "error":
            context.status = "error"
            context.error_message = result.get("message")
        else:
            context.generated_sql = result.get("generated_sql", "-- CANNOT_GENERATE_SQL")
            context.confidence_score = result.get("confidence_score", 0.0)
            
        return context

class ValidatorComponent(SQLPipelineComponent):
    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        if not context.generated_sql:
            context.generated_sql = "-- CANNOT_GENERATE_SQL"
            context.confidence_score = 0.0
            context.flag_for_review = True
            return context

        sql = context.generated_sql.strip()
        sql_clean = re.sub(r';+$', '', sql).strip()

        has_stacked_query = ';' in sql_clean
        has_comment_injection = '--' in sql_clean or '/*' in sql_clean or '*/' in sql_clean

        unsafe_pattern = re.compile(
            r'\b(DELETE|UPDATE|INSERT|DROP|ALTER|CREATE|TRUNCATE|RENAME|GRANT|REVOKE|EXEC|EXECUTE|COPY|PG_SLEEP)\b',
            re.IGNORECASE
        )
        has_unsafe_keywords = bool(unsafe_pattern.search(sql_clean))

        sql_upper = sql_clean.upper()
        is_read_only = sql_upper.startswith("SELECT") or sql_upper.startswith("WITH")

        if has_stacked_query or has_comment_injection or has_unsafe_keywords or not is_read_only or "INVALID" in sql_upper:
            context.flag_for_review = True
            context.generated_sql = "-- INVALID_QUERY"
            context.confidence_score = 0.0
        else:
            context.flag_for_review = context.confidence_score < 0.70

        return context

class SQLPipeline:
    def __init__(self, components: List[SQLPipelineComponent] = None):
        if components is None:
            self.components = [
                DatasetMatchComponent(),
                FewShotRAGComponent(),
                LLMGenerateComponent(),
                ValidatorComponent(),
            ]
        else:
            self.components = components

    def run(self, question: str) -> SQLPipelineContext:
        context = SQLPipelineContext(question=question)
        for component in self.components:
            context = component.process(context)
            if context.status == "error":
                break
        return context

    async def run_async(self, question: str) -> SQLPipelineContext:
        context = SQLPipelineContext(question=question)
        for component in self.components:
            if hasattr(component, "process_async"):
                context = await component.process_async(context)
            else:
                context = component.process(context)
            if context.status == "error":
                break
        return context

sql_pipeline = SQLPipeline()
