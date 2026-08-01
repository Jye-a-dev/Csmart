import re
from abc import ABC, abstractmethod
from pydantic import BaseModel
from typing import List, Optional

class PipelineContext(BaseModel):
    text: str
    order_id: Optional[str] = None
    order_ids: Optional[List[str]] = None
    intent: str = "GENERAL_CHAT"
    new_address: Optional[str] = None
    confidence_score: float = 0.35
    flag_for_review: bool = True

class PipelineComponent(ABC):
    @abstractmethod
    def process(self, context: PipelineContext) -> PipelineContext:
        pass

class OrderIDExtractorComponent(PipelineComponent):
    def process(self, context: PipelineContext) -> PipelineContext:
        order_ids = []
        text = context.text
        
        # Tìm tất cả các mã dạng ORD-xxxxxx
        ord_matches = re.findall(r'#?(ORD-\d+)', text, re.IGNORECASE)
        if ord_matches:
            order_ids.extend(ord_matches)
            
        # Tìm cụm danh sách số phân tách bằng dấu phẩy/khoảng trắng sau "đơn hàng", "đơn", "mã", "số"
        list_match = re.search(r'(?:đơn hàng|đơn|mã|số)\s+([\d\s,]+)', text, re.IGNORECASE)
        if list_match:
            candidates = re.findall(r'\b\d+\b', list_match.group(1))
            # Nếu là danh sách thực sự, hoặc số có độ dài lớn (mã đơn hàng thường có giá trị lớn)
            if len(candidates) > 1 or (candidates and int(candidates[0]) > 100):
                for c in candidates:
                    if c not in order_ids:
                        order_ids.append(c)
                        
        # Nếu chưa tìm được gì, tìm các số có từ 4 đến 8 chữ số
        if not order_ids:
            num_matches = re.findall(r'#?(\d{4,8})', text)
            for num in num_matches:
                if num not in order_ids:
                    order_ids.append(num)
                    
        # Dự phòng cho số ngắn có tiền tố #
        if not order_ids:
            short_num_matches = re.findall(r'#(\d+)', text)
            for num in short_num_matches:
                if num not in order_ids:
                    order_ids.append(num)

        context.order_ids = order_ids if order_ids else None
        context.order_id = order_ids[0] if order_ids else None
        return context

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

class AddressExtractorComponent(PipelineComponent):
    def process(self, context: PipelineContext) -> PipelineContext:
        if context.intent == "UPDATE_ADDRESS":
            addr_match = re.search(r'(?:sang|đến|về)\s+(?:số\s+)?(.*)$', context.text, re.IGNORECASE)
            if addr_match:
                context.new_address = addr_match.group(1).strip()
        return context

class ConfidenceScorerComponent(PipelineComponent):
    def process(self, context: PipelineContext) -> PipelineContext:
        confidence = 0.35
        if context.order_ids:
            if any("ORD-" in oid for oid in context.order_ids):
                confidence = 0.95
            else:
                confidence = 0.92
        
        if context.intent == "UPDATE_ADDRESS" and not context.new_address:
            confidence = 0.40
            
        context.confidence_score = confidence
        context.flag_for_review = confidence < 0.50
        return context

class NERPipeline:
    def __init__(self, components: List[PipelineComponent] = None):
        if components is None:
            self.components = [
                OrderIDExtractorComponent(),
                IntentClassifierComponent(),
                AddressExtractorComponent(),
                ConfidenceScorerComponent()
            ]
        else:
            self.components = components

    def run(self, text: str) -> PipelineContext:
        context = PipelineContext(text=text)
        for component in self.components:
            context = component.process(context)
        return context

# Global instance for reuse
ner_pipeline = NERPipeline()
