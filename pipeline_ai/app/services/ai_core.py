import json
import logging
import asyncio
import threading
from concurrent.futures import ThreadPoolExecutor
from typing import Generator, Any
from llama_cpp import Llama

logger = logging.getLogger(__name__)

class OneForAllAIEngine:
    """
    Singleton inference engine for Qwen2.5 GGUF using thread-safe execution locks.
    Removes hardcoded mock responses; guarantees fail-safe contract.
    """
    def __init__(self):
        self.llm: Any = None
        self._lock = threading.Lock()
        self._executor = ThreadPoolExecutor(max_workers=1)
        self._initialized = False
        self.initialize()

    def initialize(self) -> None:
        if self._initialized and self.llm is not None:
            return

        with self._lock:
            if self._initialized and self.llm is not None:
                return
            logger.info("Khởi tạo mô hình Qwen2.5-1.5B GGUF vào RAM...")
            try:
                self.llm = Llama.from_pretrained(
                    repo_id="Qwen/Qwen2.5-1.5B-Instruct-GGUF",
                    filename="*q4_k_m.gguf",
                    verbose=False,
                    n_ctx=2048,
                    n_threads=4
                )
                self._initialized = True
                logger.info("Mô hình Qwen2.5-1.5B GGUF đã nạp thành công.")
            except Exception as e:
                logger.error(f"Thất bại khi nạp mô hình Llama từ Hugging Face: {e}")
                self.llm = None
                self._initialized = False

    def is_healthy(self) -> bool:
        return self.llm is not None

    def _call_llm(self, system_prompt: str, user_input: str) -> dict:
        if self.llm is None:
            return {
                "status": "error",
                "message": "Llama model runtime is unavailable or failed to initialize",
                "confidence_score": 0.0,
                "flag_for_review": True
            }

        # Mutex lock tuần tự hóa các yêu cầu suy luận, tránh crash CPU/RAM
        with self._lock:
            try:
                output = self.llm.create_chat_completion(
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_input}
                    ],
                    max_tokens=512,
                    temperature=0.1,
                    response_format={"type": "json_object"}
                )
                text_response = output["choices"][0]["message"]["content"].strip()
                return json.loads(text_response)
            except Exception as e:
                logger.error(f"[OneForAllAIEngine] Inference error: {e}")
                return {
                    "status": "error",
                    "message": str(e),
                    "confidence_score": 0.0,
                    "flag_for_review": True
                }

    async def call_llm_async(self, system_prompt: str, user_input: str) -> dict:
        """Thực thi suy luận CPU trong ThreadPool riêng biệt, không khóa main asyncio Event Loop."""
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self._executor, self._call_llm, system_prompt, user_input)

    # 1. API CLASSIFY INTENT
    def classify_intent(self, query: str):
        system_prompt = """
        Phân loại ý định tìm kiếm e-commerce thành 1 trong các intent: [SEARCH_PRODUCT, CANCEL_ORDER, ASK_FAQ, UNKNOWN].
        Trích xuất entities (color, max_price, category).
        Trả về JSON: {"intent": "...", "entities": {...}, "confidence_score": 0.95}
        """
        return self._call_llm(system_prompt, query)

    async def classify_intent_async(self, query: str):
        system_prompt = """
        Phân loại ý định tìm kiếm e-commerce thành 1 trong các intent: [SEARCH_PRODUCT, CANCEL_ORDER, ASK_FAQ, UNKNOWN].
        Trích xuất entities (color, max_price, category).
        Trả về JSON: {"intent": "...", "entities": {...}, "confidence_score": 0.95}
        """
        return await self.call_llm_async(system_prompt, query)

    # 2. STREAMING CHATBOT COPILOT
    def stream_chat(
        self,
        history: list[dict],
        system_prompt: str | None = None,
        temperature: float = 0.7,
    ) -> Generator[str, None, None]:
        base_vi_instruction = (
            "Bạn là CSMART AI Copilot - Trợ lý bán hàng và chăm sóc khách hàng thông minh của hệ thống thương mại điện tử CSMART.\n"
            "QUY TẮC BẮT BUỘC: Bạn PHẢI luôn luôn phản hồi 100% bằng Tiếng Việt tự nhiên, lịch sự, chính xác và dễ hiểu. "
            "Tuyệt đối không trả lời bằng Tiếng Anh hoặc ngôn ngữ khác (ngoại trừ mã sản phẩm, SKU hoặc tên thương hiệu riêng)."
        )

        full_system_prompt = f"{base_vi_instruction}\n\n{system_prompt}" if system_prompt else base_vi_instruction

        if self.llm is None:
            yield "Dịch vụ AI Copilot hiện đang bảo trì hoặc chưa sẵn sàng. Vui lòng thử lại sau hoặc liên hệ nhân viên hỗ trợ."
            return

        messages = [{"role": "system", "content": full_system_prompt}] + history

        with self._lock:
            try:
                response_stream = self.llm.create_chat_completion(
                    messages=messages,
                    max_tokens=512,
                    temperature=temperature,
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
                logger.error(f"[OneForAllAIEngine] Streaming failed: {e}")
                yield f"\n[Gián đoạn mô hình AI: {str(e)}]"

    # 3. API PARSE OCR ENTITIES WITH LLM
    def parse_ocr_entities(self, raw_ocr_text: str) -> dict:
        if not raw_ocr_text or not raw_ocr_text.strip():
            return {}
            
        system_prompt = """
        Bạn là chuyên gia bóc tách dữ liệu sản phẩm thương mại điện tử Việt Nam.
        Nhiệm vụ: Trích xuất các thực thể từ chuỗi văn bản OCR thô từ nhãn/ảnh sản phẩm.
        Định dạng trả về duy nhất là JSON object:
        {
          "brand": "Thương hiệu (ví dụ: Cortisza, Puma, Nike, Unbranded...)",
          "product_name": "Tên sản phẩm đầy đủ (ví dụ: Áo Thể Thao Cortisza 25TH DECEMBER)",
          "category": "Loại sản phẩm (Áo, Quần, Sneakers, Phụ kiện)",
          "size": "Size (ví dụ: L, Freesize, UK 8, EUR 42)",
          "color": "Màu sắc (ví dụ: Đỏ, Xanh, Đen, Trắng)",
          "price": 450000,
          "sku_barcode": "Mã vạch / SKU"
        }
        """
        return self._call_llm(system_prompt, raw_ocr_text)

# Khởi tạo Instance Singleton
ai_engine_core = OneForAllAIEngine()
