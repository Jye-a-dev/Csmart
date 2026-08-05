from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.services.ai_core import ai_engine_core
import json

router = APIRouter()

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
    
    def event_generator():
        for chunk in ai_engine_core.stream_chat(history):
            # Send SSE format JSON payload
            yield f"data: {json.dumps({'text': chunk}, ensure_ascii=False)}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")
