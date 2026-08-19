import asyncio
import json
import logging
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.ai_core import ai_engine_core

router = APIRouter()
logger = logging.getLogger(__name__)


class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


@router.post(
    "/chat",
    summary="Tư vấn mua sắm Real-time Chatbot (SSE)",
    description="Nhận lịch sử trò chuyện và trả về luồng phản hồi thời gian thực (Server-Sent Events) từ trợ lý mua sắm AI Qwen."
)
async def copilot_chat(payload: ChatRequest):
    history = [{"role": msg.role, "content": msg.content} for msg in payload.messages]

    async def event_generator():
        try:
            for chunk in ai_engine_core.stream_chat(history):
                yield f"data: {json.dumps({'text': chunk}, ensure_ascii=False)}\n\n"
                await asyncio.sleep(0)  # Yield control cho event loop giữa mỗi chunk
        except asyncio.CancelledError:
            # Client đóng tab / ngắt kết nối giữa stream → thoát clean, không raise
            logger.info("[Copilot] SSE client disconnected gracefully.")
        except Exception as e:
            logger.error(f"[Copilot] Streaming error: {str(e)}")
            yield f"data: {json.dumps({'error': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Tắt nginx buffering để SSE hoạt động đúng
        }
    )

