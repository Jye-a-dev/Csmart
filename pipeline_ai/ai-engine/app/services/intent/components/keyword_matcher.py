from app.services.intent.base import IntentPipelineComponent
from app.services.intent.context import IntentPipelineContext

class KeywordMatcherComponent(IntentPipelineComponent):
    def process(self, context: IntentPipelineContext) -> IntentPipelineContext:
        query_lower = context.query.lower()
        
        # Check CANCEL_ORDER fast path
        if any(k in query_lower for k in ["hủy đơn", "huy don", "hủy đơn hàng", "cancel order"]):
            context.intent = "CANCEL_ORDER"
            context.confidence_score = 0.95
            
        # Check SEARCH_PRODUCT fast path
        elif any(k in query_lower for k in ["tìm sản phẩm", "tìm áo", "tìm quần", "mua áo", "mua quần"]):
            context.intent = "SEARCH_PRODUCT"
            context.confidence_score = 0.90

        # Check ASK_FAQ fast path
        elif any(k in query_lower for k in ["mấy giờ đóng cửa", "địa chỉ shop", "cửa hàng ở đâu"]):
            context.intent = "ASK_FAQ"
            context.confidence_score = 0.90
            
        return context
