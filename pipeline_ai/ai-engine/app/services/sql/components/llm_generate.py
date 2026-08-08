from app.services.sql.base import SQLPipelineComponent
from app.services.sql.context import SQLPipelineContext
from app.services.ai_core import ai_engine_core

class LLMGenerateComponent(SQLPipelineComponent):
    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        if context.generated_sql and context.confidence_score >= 0.70:
            return context

        system_prompt = """
        Bạn là chuyên gia PostgreSQL của SmartCart.
        Database Schema:
        - users (id, full_name, email, role)
        - products (id, name, price, stock)
        - orders (id, user_id, status, created_at)
        - order_items (id, order_id, product_id, quantity)

        Nhiệm vụ: Dịch câu hỏi thành câu lệnh SQL Read-Only (SELECT).
        QUY TẮC BẮT BUỘC:
        1. Nếu câu hỏi là Yêu cầu thiết kế Schema/DDL (ví dụ: 'Mỗi khách hàng có tên, email...') hoặc vô nghĩa -> Trả về generated_sql = "-- INVALID_QUERY" và confidence_score = 0.1.
        2. BẮT BUỘC chỉ sinh câu lệnh SQL Read-Only (SELECT). Tuyệt đối KHÔNG sinh câu lệnh sửa đổi dữ liệu (DELETE, UPDATE, INSERT, DROP, v.v.).
        3. Nếu câu hỏi yêu cầu xóa/sửa đổi/hủy dữ liệu (ví dụ: 'hủy các đơn hàng ở tphcm'), bạn PHẢI chuyển đổi yêu cầu đó thành câu lệnh SELECT tương ứng để truy vấn/hiển thị danh sách dữ liệu mục tiêu (ví dụ: `SELECT orders.* FROM orders JOIN users ON orders.user_id = users.id WHERE users.full_name LIKE '%tphcm%'` hoặc lọc theo điều kiện tương ứng).

        Trả về định dạng JSON duy nhất:
        {"generated_sql": "...", "confidence_score": 0.9, "flag_for_review": false}
        """

        result = ai_engine_core._call_llm(system_prompt, context.question)
        if result.get("status") == "error":
            context.status = "error"
            context.error_message = result.get("message")
        else:
            context.generated_sql = result.get("generated_sql", "-- CANNOT_GENERATE_SQL")
            context.confidence_score = result.get("confidence_score", 0.0)
            
        return context
