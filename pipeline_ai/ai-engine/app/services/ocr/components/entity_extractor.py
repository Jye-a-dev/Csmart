import re
from app.services.ocr.base import OCRPipelineComponent
from app.services.ocr.context import OCRPipelineContext

class OCREntityExtractorComponent(OCRPipelineComponent):
    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        raw_text = context.raw_text or ""
        text_lower = raw_text.lower()
        
        # 1. Document Type Detection
        if any(k in text_lower for k in ['hóa đơn', 'hoa don', 'invoice', 'thu tiền', 'bán hàng', 'thành tiền']):
            context.document_type = 'INVOICE'
        elif any(k in text_lower for k in ['vận đơn', 'van don', 'giao hàng', 'tracking', 'bưu gửi', 'cod', 'người nhận']):
            context.document_type = 'SHIPPING_LABEL'
        else:
            context.document_type = 'PRODUCT_LABEL'

        # 2. Colors (Màu sắc)
        colors = ['đen', 'trắng', 'xanh', 'đỏ', 'vàng', 'hồng', 'xám', 'nâu', 'tím', 'cam']
        detected_colors = [c for c in colors if c in text_lower]
        context.detected_color = detected_colors[0].capitalize() if detected_colors else None
        
        # 3. Types (Loại sản phẩm)
        types = ['áo', 'quần', 'váy', 'đầm', 'mũ', 'nón', 'giày', 'dép', 'túi', 'balo', 'khoác', 'thun', 'sơ mi', 'jean']
        detected_types = [t for t in types if t in text_lower]
        context.detected_type = detected_types[0] if detected_types else None

        # 4. Origin (Nguồn gốc / Xuất xứ)
        origins = ['việt nam', 'trung quốc', 'hàn quốc', 'nhật bản', 'mỹ', 'đức', 'thái lan', 'quảng châu', 'taiwan', 'china', 'vietnam']
        detected_origins = [o for o in origins if o in text_lower or f"made in {o}" in text_lower]
        context.detected_origin = detected_origins[0].title() if detected_origins else None

        # 5. Product Name (Tên sản phẩm)
        name_match = re.search(r'(?:tên sp|tên sản phẩm|sản phẩm|tên|name)\s*:\s*([^\n,]+)', raw_text, re.IGNORECASE)
        if name_match:
            context.detected_name = name_match.group(1).strip()
        else:
            context.detected_name = None

        # 6. Order / Tracking Code
        code_match = re.search(r'\b(ORD-\d+|INV-\d+|GHN-\d+|SKU-\d+|#\d+)\b', raw_text, re.IGNORECASE)
        if code_match:
            context.detected_order_code = code_match.group(1).upper()

        # 7. Customer / Recipient Name
        cust_match = re.search(r'(?:khách hàng|người nhận|kh|kh:)\s*:\s*([^\n,-]+)', raw_text, re.IGNORECASE)
        if cust_match:
            context.detected_customer_name = cust_match.group(1).strip()

        # 8. Phone Number
        phone_match = re.search(r'\b(0[35789]\d{8}|0\d{2,3}[\s\.]?\d{3}[\s\.]?\d{3,4})\b', raw_text)
        if phone_match:
            context.detected_phone_number = phone_match.group(1).replace(' ', '').replace('.', '')

        # 9. Address
        addr_match = re.search(r'(?:địa chỉ|đ/c|address)\s*:\s*([^\n]+)', raw_text, re.IGNORECASE)
        if addr_match:
            context.detected_address = addr_match.group(1).strip()

        # 10. Total Amount / COD Price
        amt_match = re.search(r'([\d\.,]{4,})\s*(?:vnđ|đ|vnd|đồng)', text_lower)
        if amt_match:
            try:
                amt_str = amt_match.group(1).replace('.', '').replace(',', '')
                context.detected_total_amount = float(amt_str)
            except ValueError:
                pass

        return context
