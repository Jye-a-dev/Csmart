import json
import logging
from llama_cpp import Llama

logger = logging.getLogger(__name__)

class OneForAllAIEngine:
    def __init__(self):
        logger.info("🚀 Đang khởi tạo mô hình Qwen2.5-1.5B từ Hugging Face qua Python...")
        # Llama.from_pretrained sẽ TỰ ĐỘNG tải file weight GGUF (~1GB) từ HuggingFace qua CMD
        # và lưu vào cache local ngay lần chạy đầu tiên.
        try:
            self.llm = Llama.from_pretrained(
                repo_id="Qwen/Qwen2.5-1.5B-Instruct-GGUF",
                filename="*q4_k_m.gguf",
                verbose=False,
                n_ctx=2048,      # Độ dài ngữ cảnh
                n_threads=4      # Số nhân CPU dùng để chạy (tùy chỉnh theo máy bạn)
            )
            logger.info("✅ Mô hình AI đã nạp thành công vào RAM!")
        except Exception as e:
            logger.error(f"Thất bại khi nạp mô hình Llama từ Hugging Face: {e}")
            self.llm = None

    def _call_llm(self, system_prompt: str, user_input: str) -> dict:
        if self.llm is None:
            return {"status": "error", "message": "Llama model is not initialized."}
            
        try:
            output = self.llm.create_chat_completion(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                max_tokens=512,
                temperature=0.1, # Nhiệt độ thấp để trả về kết quả chính xác, không ảo tưởng
                response_format={"type": "json_object"} # Ép trả về JSON chuẩn
            )
            text_response = output["choices"][0]["message"]["content"].strip()
            return json.loads(text_response)
        except Exception as e:
            return {"status": "error", "message": str(e)}

    # 1. API TEXT-TO-SQL DYNAMIC
    def text_to_sql(self, question: str):
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
        return self._call_llm(system_prompt, question)

    # 2. API CLASSIFY INTENT
    def classify_intent(self, query: str):
        system_prompt = """
        Phân loại ý định tìm kiếm e-commerce thành 1 trong các intent: [SEARCH_PRODUCT, CANCEL_ORDER, ASK_FAQ, UNKNOWN].
        Trích xuất entities (color, max_price, category).
        Trả về JSON: {"intent": "...", "entities": {...}, "confidence_score": 0.95}
        """
        return self._call_llm(system_prompt, query)

    # 3. STREAMING CHATBOT COPILOT
    def stream_chat(self, history: list[dict]):
        if self.llm is None:
            yield "Dịch vụ AI chưa sẵn sàng."
            return
            
        system_prompt = (
            "Bạn là trợ lý mua sắm AI Copilot thông minh của SmartCart. "
            "Hãy hỗ trợ và tư vấn mua sắm, trả lời các thắc mắc về đơn hàng, sản phẩm của shop. "
            "Trả lời ngắn gọn, tự nhiên, thân thiện bằng Tiếng Việt."
        )
        
        messages = [{"role": "system", "content": system_prompt}] + history
        
        try:
            response_stream = self.llm.create_chat_completion(
                messages=messages,
                max_tokens=512,
                temperature=0.7,
                stream=True
            )
            for chunk in response_stream:
                choices = chunk.get("choices", [])
                if choices:
                    delta = choices[0].get("delta", {})
                    content = delta.get("content", "")
                    if content:
                        yield content
        except Exception as e:
            yield f"\n[Lỗi AI]: {str(e)}"

# Khởi tạo Instance Singleton
ai_engine_core = OneForAllAIEngine()
