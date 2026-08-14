import logging
import asyncio
from app.services.sql.base import SQLPipelineComponent
from app.services.sql.context import SQLPipelineContext
from app.services.database import db_service

logger = logging.getLogger(__name__)

class FewShotRAGComponent(SQLPipelineComponent):
    """
    Component lấy các ví dụ đã được Reviewer sửa đổi & duyệt (status IN ('LABELLED', 'APPROVED'))
    từ bảng ai_review_queue để nhúng làm ngữ cảnh Few-Shot RAG cho Prompt sinh SQL.
    """
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
                # If running inside an existing event loop, create task or execute async fetch
                task = loop.create_task(self.get_few_shot_examples())
                # Or wait if sync context inside running loop
                # In FastAPI endpoint, we will invoke process_async
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
