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
            
        prompt = f"<|im_start|>system\n{system_prompt}\n<|im_end|>\n<|im_start|>user\n{user_input}\n<|im_end|>\n<|im_start|>assistant\n"
        
        try:
            output = self.llm(
                prompt,
                max_tokens=512,
                stop=["<|im_end|>"],
                temperature=0.1, # Nhiệt độ thấp để trả về kết quả chính xác, không ảo tưởng
                response_format={"type": "json_object"} # Ép trả về JSON chuẩn
            )
            text_response = output["choices"][0]["text"].strip()
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
        2. Nếu là câu hỏi truy vấn hợp lệ -> Sinh câu lệnh SQL chuẩn và confidence_score >= 0.85.

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

# Khởi tạo Instance Singleton
ai_engine_core = OneForAllAIEngine()
