from app.services.sql.base import SQLPipelineComponent
from app.services.sql.context import SQLPipelineContext
from app.services.ai_core import ai_engine_core

class LLMGenerateComponent(SQLPipelineComponent):
    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        if context.generated_sql and context.confidence_score >= 0.70:
            return context

        system_prompt = """
        Bạn là chuyên gia PostgreSQL của hệ thống CsmartAI.
        BẢNG THÔNG TIN SCHEMA CỦA DATABASE HIỆN TẠI (BẮT BUỘC CHỈ SỬ DỤNG CÁC BẢNG VÀ CỘT NÀY):
        - categories (id UUID, name, slug, description, parent_id, image_url_1, image_url_2, created_at)
        - products (id INT, sku, name, slug, category_id UUID, description, base_price, discount_price, stock_quantity, status, is_published, tags, attributes, created_at, updated_at)
        - users (id INT, uuid, full_name, email, phone, role, is_active, avatar_url, last_login_at, created_at, updated_at)
        - user_addresses (id INT, user_id INT, recipient_name, phone, street_address, ward, district, city_province, is_default, created_at)
        - orders (id INT, order_code, user_id INT, status, total_amount, shipping_fee, discount_amount, shipping_address, note, cancel_reason, created_at, updated_at)
        - order_items (id INT, order_id INT, product_id INT, product_name, unit_price, quantity, subtotal, shipping_status, courier_name, tracking_number, estimated_delivery, delivered_at)
        - payments (id INT, order_id INT, payment_method, payment_status, transaction_code, amount, paid_at, created_at)
        - faqs (id INT, topic, question, answer, is_active, created_at)

        QUY TẮC BẮT BUỘC VỀ TÊN BẢNG VÀ CỘT:
        1. Bảng categories: Cột id (UUID), name (Tên danh mục). Tuyệt đối KHÔNG DÙNG category_id hay category_name làm tên cột của bảng categories!
        2. Bảng products: Liên kết với categories bằng `products.category_id = categories.id`.
        3. CHỈ SINH CÂU LỆNH SQL READ-ONLY (SELECT / WITH). Không sinh DDL/DML (DELETE, UPDATE, INSERT, DROP, ALTER).
        4. Với câu hỏi "Cho tôi số lượng danh mục và tên của nó": `SELECT count(*) as total_categories, string_agg(name, ', ') as category_names FROM categories;` hoặc `SELECT id, name FROM categories;`

        Trả về định dạng JSON duy nhất:
        {"generated_sql": "...", "confidence_score": 0.95, "flag_for_review": false}
        """

        result = ai_engine_core._call_llm(system_prompt, context.question)
        if result.get("status") == "error":
            context.status = "error"
            context.error_message = result.get("message")
        else:
            context.generated_sql = result.get("generated_sql", "-- CANNOT_GENERATE_SQL")
            context.confidence_score = result.get("confidence_score", 0.0)
            
        return context
