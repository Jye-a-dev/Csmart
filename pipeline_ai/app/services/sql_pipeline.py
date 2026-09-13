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
    """
    Step 1: Matches natural language query against validated e-commerce query templates.
    Rejects generic cross-domain benchmark schemas to ensure CsmartAI compatibility.
    """
    ALLOWED_TABLES = {
        "categories", "products", "users", "user_addresses",
        "orders", "order_items", "payments", "faqs"
    }

    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        if context.generated_sql:
            return context

        query, score = vitext2sql_service.translate_with_score(context.question)
        query_lower = query.lower()
        has_valid_table = any(
            f" {tbl} " in f" {query_lower} " or f" {tbl};" in f" {query_lower} "
            for tbl in self.ALLOWED_TABLES
        )
        has_int_id_clause = bool(
            re.search(r'\b(id|user_id|category_id|product_id|order_id)\s*=\s*\d+\b', query_lower)
        )

        if score >= 0.85 and has_valid_table and not has_int_id_clause:
            context.generated_sql = query
            context.confidence_score = score
            context.flag_for_review = False
            logger.info(f"[DatasetMatchComponent] Exact verified match accepted (Confidence: {score:.2f})")

        return context

class FewShotRAGComponent(SQLPipelineComponent):
    """
    Step 2: Fetches verified LABELLED and APPROVED examples from ai_review_queue to ground LLM inference.
    """
    def __init__(self, limit: int = 5):
        self.limit = limit

    async def get_few_shot_examples(self) -> str:
        if db_service.pool is None:
            return ""

        try:
            query = """
                SELECT input_text, corrected_label 
                FROM ai_review_queue 
                WHERE status IN ('LABELLED', 'APPROVED') 
                  AND endpoint = 'text-to-sql'
                  AND corrected_label IS NOT NULL 
                  AND TRIM(corrected_label) != ''
                ORDER BY reviewed_at DESC NULLS LAST, created_at DESC 
                LIMIT $1;
            """
            rows = await db_service.fetch(query, self.limit)
            if not rows:
                return ""

            examples = "\nCÁC CÂU TRUY VẤN MẪU ĐÃ ĐƯỢC DUYỆT (PRODUCTION VERIFIED):\n"
            for row in rows:
                input_text = row["input_text"] or ""
                corrected_sql = row["corrected_label"] or ""
                # Ensure retrieved examples do not propagate invalid integer ID comparisons
                if not re.search(r'\b(id|user_id|category_id|product_id|order_id)\s*=\s*\d+\b', corrected_sql):
                    examples += f"- Câu hỏi: {input_text}\n  SQL: {corrected_sql}\n"
            return examples
        except Exception as e:
            logger.error(f"[FewShotRAGComponent] Failed to fetch examples: {e}")
            return ""

    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        try:
            loop = asyncio.get_event_loop()
            if not loop.is_running():
                context.few_shot_examples = loop.run_until_complete(self.get_few_shot_examples())
        except Exception:
            context.few_shot_examples = ""
        return context

    async def process_async(self, context: SQLPipelineContext) -> SQLPipelineContext:
        context.few_shot_examples = await self.get_few_shot_examples()
        return context

class LLMGenerateComponent(SQLPipelineComponent):
    """
    Step 3: Synthesizes PostgreSQL SELECT statements via Qwen LLM.
    Strictly mandates UUID literals and relationships; prohibits integer primary/foreign keys.
    """
    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        if context.generated_sql and context.confidence_score >= 0.85:
            return context

        few_shot = context.few_shot_examples or ""
        system_prompt = f"""
Bạn là chuyên gia PostgreSQL của hệ thống CsmartAI.
DATABASE SCHEMA CHUẨN (MỌI KHÓA CHÍNH VÀ KHÓA NGOẠI LÀ UUID, TUYỆT ĐỐI KHÔNG DÙNG INTEGER CHO ID):
- categories (id UUID, name VARCHAR, slug VARCHAR, description TEXT, parent_id UUID, image_url_1 TEXT, image_url_2 TEXT, created_at TIMESTAMPTZ)
- products (id UUID, sku VARCHAR, name VARCHAR, slug VARCHAR, category_id UUID, description TEXT, base_price NUMERIC(12,2), discount_price NUMERIC(12,2), stock_quantity INT, status VARCHAR, is_published BOOLEAN, tags VARCHAR[], attributes JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
- users (id UUID, full_name VARCHAR, email VARCHAR, phone VARCHAR, role VARCHAR, is_active BOOLEAN, avatar_url TEXT, last_login_at TIMESTAMPTZ, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
- user_addresses (id UUID, user_id UUID, recipient_name VARCHAR, phone VARCHAR, street_address TEXT, ward VARCHAR, district VARCHAR, city_province VARCHAR, is_default BOOLEAN, created_at TIMESTAMPTZ)
- orders (id UUID, order_code VARCHAR, user_id UUID, status VARCHAR, total_amount NUMERIC(12,2), shipping_fee NUMERIC(10,2), discount_amount NUMERIC(10,2), shipping_address TEXT, note TEXT, cancel_reason TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
- order_items (id UUID, order_id UUID, product_id UUID, product_name VARCHAR, unit_price NUMERIC(12,2), quantity INT, subtotal NUMERIC(12,2), shipping_status VARCHAR, courier_name VARCHAR, tracking_number VARCHAR, estimated_delivery TIMESTAMPTZ, delivered_at TIMESTAMPTZ)
- payments (id UUID, order_id UUID, payment_method VARCHAR, payment_status VARCHAR, transaction_code VARCHAR, amount NUMERIC(12,2), paid_at TIMESTAMPTZ, created_at TIMESTAMPTZ)
- faqs (id UUID, topic VARCHAR, question TEXT, answer TEXT, is_active BOOLEAN, created_at TIMESTAMPTZ)

QUY TẮC BẮT BUỘC:
1. ID và Khóa ngoại là kiểu UUID. TUYỆT ĐỐI KHÔNG sinh điều kiện dạng `WHERE id = 1` hoặc `WHERE user_id = 5` (PostgreSQL sẽ ném lỗi cast 'operator does not exist: uuid = integer').
2. Khi người dùng tìm theo mã, bắt buộc lọc theo cột chuỗi: `order_code = 'ORD-...'`, `sku = '...'`, `email = '...'`, `phone = '...'`. Nếu bắt buộc ép UUID literal, phải dùng format: `'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid`.
3. CHỈ SINH CÂU TRUY VẤN READ-ONLY BẮT ĐẦU BẰNG `SELECT` HOẶC `WITH`. Tuyệt đối không sinh INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, EXEC, EXECUTE.
4. Với câu hỏi Yes/No: Dùng cú pháp `SELECT EXISTS(...) AS answer` hoặc `SELECT COUNT(*) > 0 AS answer ...`.
{few_shot}
Trả về định dạng JSON duy nhất:
{{"generated_sql": "SELECT ...", "confidence_score": 0.95, "flag_for_review": false}}
"""
        result = ai_engine_core._call_llm(system_prompt, context.question)
        if result.get("status") == "error":
            context.status = "failed"
            context.error_message = result.get("message")
            context.generated_sql = "-- INFERENCE_FAILED"
            context.confidence_score = 0.0
            context.flag_for_review = True
        else:
            context.generated_sql = result.get("generated_sql", "-- INFERENCE_FAILED")
            context.confidence_score = float(result.get("confidence_score", 0.0))
            context.flag_for_review = result.get("flag_for_review", True)
            
        return context

    async def process_async(self, context: SQLPipelineContext) -> SQLPipelineContext:
        if context.generated_sql and context.confidence_score >= 0.85:
            return context

        few_shot = context.few_shot_examples or ""
        system_prompt = f"""
Bạn là chuyên gia PostgreSQL của hệ thống CsmartAI.
DATABASE SCHEMA CHUẨN (MỌI KHÓA CHÍNH VÀ KHÓA NGOẠI LÀ UUID, TUYỆT ĐỐI KHÔNG DÙNG INTEGER CHO ID):
- categories (id UUID, name VARCHAR, slug VARCHAR, description TEXT, parent_id UUID, image_url_1 TEXT, image_url_2 TEXT, created_at TIMESTAMPTZ)
- products (id UUID, sku VARCHAR, name VARCHAR, slug VARCHAR, category_id UUID, description TEXT, base_price NUMERIC(12,2), discount_price NUMERIC(12,2), stock_quantity INT, status VARCHAR, is_published BOOLEAN, tags VARCHAR[], attributes JSONB, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
- users (id UUID, full_name VARCHAR, email VARCHAR, phone VARCHAR, role VARCHAR, is_active BOOLEAN, avatar_url TEXT, last_login_at TIMESTAMPTZ, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
- user_addresses (id UUID, user_id UUID, recipient_name VARCHAR, phone VARCHAR, street_address TEXT, ward VARCHAR, district VARCHAR, city_province VARCHAR, is_default BOOLEAN, created_at TIMESTAMPTZ)
- orders (id UUID, order_code VARCHAR, user_id UUID, status VARCHAR, total_amount NUMERIC(12,2), shipping_fee NUMERIC(10,2), discount_amount NUMERIC(10,2), shipping_address TEXT, note TEXT, cancel_reason TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
- order_items (id UUID, order_id UUID, product_id UUID, product_name VARCHAR, unit_price NUMERIC(12,2), quantity INT, subtotal NUMERIC(12,2), shipping_status VARCHAR, courier_name VARCHAR, tracking_number VARCHAR, estimated_delivery TIMESTAMPTZ, delivered_at TIMESTAMPTZ)
- payments (id UUID, order_id UUID, payment_method VARCHAR, payment_status VARCHAR, transaction_code VARCHAR, amount NUMERIC(12,2), paid_at TIMESTAMPTZ, created_at TIMESTAMPTZ)
- faqs (id UUID, topic VARCHAR, question TEXT, answer TEXT, is_active BOOLEAN, created_at TIMESTAMPTZ)

QUY TẮC BẮT BUỘC:
1. ID và Khóa ngoại là kiểu UUID. TUYỆT ĐỐI KHÔNG sinh điều kiện dạng `WHERE id = 1` hoặc `WHERE user_id = 5` (PostgreSQL sẽ ném lỗi cast 'operator does not exist: uuid = integer').
2. Khi người dùng tìm theo mã, bắt buộc lọc theo cột chuỗi: `order_code = 'ORD-...'`, `sku = '...'`, `email = '...'`, `phone = '...'`. Nếu bắt buộc ép UUID literal, phải dùng format: `'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid`.
3. CHỈ SINH CÂU TRUY VẤN READ-ONLY BẮT ĐẦU BẰNG `SELECT` HOẶC `WITH`. Tuyệt đối không sinh INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, EXEC, EXECUTE.
4. Với câu hỏi Yes/No: Dùng cú pháp `SELECT EXISTS(...) AS answer` hoặc `SELECT COUNT(*) > 0 AS answer ...`.
{few_shot}
Trả về định dạng JSON duy nhất:
{{"generated_sql": "SELECT ...", "confidence_score": 0.95, "flag_for_review": false}}
"""
        result = await ai_engine_core.call_llm_async(system_prompt, context.question)
        if result.get("status") == "error":
            context.status = "failed"
            context.error_message = result.get("message")
            context.generated_sql = "-- INFERENCE_FAILED"
            context.confidence_score = 0.0
            context.flag_for_review = True
        else:
            context.generated_sql = result.get("generated_sql", "-- INFERENCE_FAILED")
            context.confidence_score = float(result.get("confidence_score", 0.0))
            context.flag_for_review = result.get("flag_for_review", True)

        return context

class ValidatorComponent(SQLPipelineComponent):
    """
    Step 4: Strict Security and Semantic Guardrail.
    Blocks Stacked Queries, SQL Comment Injections, CTE write attacks, and UUID-integer type mismatches.
    """
    UNSAFE_PATTERN = re.compile(
        r'\b(DELETE|UPDATE|INSERT|DROP|ALTER|CREATE|TRUNCATE|RENAME|GRANT|REVOKE|EXEC|EXECUTE|COPY|PG_SLEEP)\b',
        re.IGNORECASE
    )
    CTE_WRITE_PATTERN = re.compile(
        r'\bWITH\b[\s\S]*?\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE)\b',
        re.IGNORECASE
    )
    UUID_INT_MISMATCH = re.compile(
        r'\b(id|user_id|category_id|product_id|order_id)\s*=\s*\d+\b',
        re.IGNORECASE
    )

    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        if not context.generated_sql or context.generated_sql.startswith("--"):
            context.flag_for_review = True
            context.confidence_score = 0.0
            return context

        sql = context.generated_sql.strip()
        sql_clean = re.sub(r';+$', '', sql).strip()

        # Reject stacked queries and comments
        has_stacked = ';' in sql_clean
        has_comments = '--' in sql_clean or '/*' in sql_clean or '*/' in sql_clean
        has_unsafe_words = bool(self.UNSAFE_PATTERN.search(sql_clean))
        has_cte_write = bool(self.CTE_WRITE_PATTERN.search(sql_clean))
        has_uuid_mismatch = bool(self.UUID_INT_MISMATCH.search(sql_clean))

        sql_upper = sql_clean.upper()
        is_read_only = sql_upper.startswith("SELECT") or sql_upper.startswith("WITH")

        if (
            has_stacked
            or has_comments
            or has_unsafe_words
            or has_cte_write
            or not is_read_only
            or has_uuid_mismatch
            or "INVALID" in sql_upper
        ):
            logger.warning(f"[ValidatorComponent] Blocked invalid/unsafe SQL: {sql_clean}")
            context.flag_for_review = True
            context.generated_sql = "-- INVALID_QUERY"
            context.confidence_score = 0.0
            context.status = "failed"
            context.error_message = "SQL validation failed: contains illegal operations or UUID/Integer schema mismatch"
        else:
            context.generated_sql = sql_clean
            context.flag_for_review = context.confidence_score < 0.75

        return context

class SQLPipeline:
    def __init__(self, components: Optional[List[SQLPipelineComponent]] = None):
        self.components = components or [
            DatasetMatchComponent(),
            FewShotRAGComponent(),
            LLMGenerateComponent(),
            ValidatorComponent(),
        ]

    def run(self, question: str) -> SQLPipelineContext:
        context = SQLPipelineContext(question=question)
        for component in self.components:
            context = component.process(context)
            if context.status == "failed" and context.generated_sql == "-- INFERENCE_FAILED":
                break
        return context

    async def run_async(self, question: str) -> SQLPipelineContext:
        context = SQLPipelineContext(question=question)
        for component in self.components:
            if hasattr(component, "process_async"):
                context = await component.process_async(context)
            else:
                context = component.process(context)
            if context.status == "failed" and context.generated_sql == "-- INFERENCE_FAILED":
                break
        return context

sql_pipeline = SQLPipeline()
