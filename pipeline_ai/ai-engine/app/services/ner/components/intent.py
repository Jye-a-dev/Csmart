from app.services.ner.context import PipelineContext
from app.services.ner.base import PipelineComponent

class IntentClassifierComponent(PipelineComponent):
    def process(self, context: PipelineContext) -> PipelineContext:
        text_lower = context.text.lower()
        intent = "GENERAL_CHAT"
        if any(k in text_lower for k in ["hủy", "huy", "del", "delete", "xóa", "xoa", "cancel"]):
            intent = "CANCEL_ORDER"
        elif any(k in text_lower for k in ["đổi địa chỉ", "doi dia chi", "địa chỉ mới", "sang số"]):
            intent = "UPDATE_ADDRESS"
        elif any(k in text_lower for k in ["giao tới đâu", "giao den dau", "đang ở đâu", "giao tới", "giao đến", "trạng thái", "track"]):
            intent = "TRACK_ORDER"
        
        context.intent = intent
        return context
