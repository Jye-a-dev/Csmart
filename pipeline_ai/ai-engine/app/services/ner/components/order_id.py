import re
from app.services.ner.context import PipelineContext
from app.services.ner.base import PipelineComponent

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
