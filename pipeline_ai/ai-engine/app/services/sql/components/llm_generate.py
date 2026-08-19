from app.services.sql.base import SQLPipelineComponent
from app.services.sql.context import SQLPipelineContext
from app.services.ai_core import ai_engine_core

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
