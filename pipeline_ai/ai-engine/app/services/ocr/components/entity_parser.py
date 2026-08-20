import re
import logging
from typing import Dict, Any, List, Optional
from app.services.ocr.base import OCRPipelineComponent
from app.services.ocr.context import OCRPipelineContext

logger = logging.getLogger(__name__)

# Known Global & Local Brands
_KNOWN_BRANDS = [
    "PUMA", "NIKE", "ADIDAS", "UNIQLO", "ZARA", "CONVERSE", "VANS",
    "JORDAN", "NEW BALANCE", "REEBOK", "MLB", "LACOSTE", "GUCCI",
    "CHANEL", "LEVIS", "LEVI'S", "H&M", "UNDER ARMOUR", "ASICS",
    "FILA", "CHAMPION", "SUPREME", "BALENCIAGA", "PULL&BEAR", "MANGO",
    "SAMSUNG", "SONY", "APPLE", "XIAOMI", "LG", "PANASONIC", "DELL",
    "HP", "ASUS", "ACER", "LENOVO", "LOREAL", "L'OREAL", "MAYBELLINE",
    "CORTISZA", "SENKA", "INNISFREE", "ANESSA", "LOGITECH"
]

# Category Keyword Dictionaries
_CATEGORY_MAP = {
    "Electronics": ["laptop", "phone", "điện thoại", "camera", "voltage", "mah", "pin", "bluetooth", "wifi", "tv", "màn hình", "cpu", "ram", "amp", "watt", "speaker", "tai nghe"],
    "Fashion": ["áo", "quần", "váy", "đầm", "áo khoác", "sơ mi", "thun", "jean", "jeans", "sweater", "hoodie", "shirt", "pants", "dress", "skirt", "t-shirt"],
    "Footwear": ["giày", "dép", "sneaker", "sneakers", "shoe", "shoes", "boot", "sandal", "cleats", "runner"],
    "Cosmetics": ["kem", "serum", "son", "phấn", "toner", "lotion", "cream", "mask", "dầu gội", "sữa rửa mặt", "makeup", "lipstick", "sunscreen", "nước hoa"],
    "Appliances": ["quạt", "nồi", "chảo", "bếp", "máy giặt", "tủ lạnh", "lò vi sóng", "cooker", "oven", "fridge", "fan", "nồi cơm"],
    "Grocery": ["nước", "chè", "trà", "bánh", "kẹo", "sữa", "cafe", "coffee", "snack", "food", "beverage", "thực phẩm"],
    "Invoice": ["hóa đơn", "invoice", "thu tiền", "thành tiền", "xuất bán", "bán hàng"],
    "Shipping": ["vận đơn", "giao hàng", "tracking", "bưu gửi", "cod", "ghn", "ghtk", "người nhận"]
}

# Specification Start Markers
_SPEC_START_MARKERS = [
    r'SPEC:', r'SPECIFICATION:', r'THÀNH PHẦN:', r'COMPOSITION:', r'INGREDIENTS:',
    r'MODEL:', r'INPUT:', r'OUTPUT:', r'VOLTAGE:', r'POWER:', r'CAPACITY:',
    r'SIZE:', r'KÍCH THƯỚC:', r'XUẤT XỨ:', r'MADE IN:', r'HƯỚNG DẪN:', r'BẢO QUẢN:',
    r'CHẤT LIỆU:', r'MATERIAL:', r'TRỌNG LƯỢNG:', r'WEIGHT:', r'MÀU SẮC:', r'COLOR:'
]

_COLOR_MAP = {
    "white": "Trắng", "trắng": "Trắng",
    "black": "Đen", "đen": "Đen",
    "red": "Đỏ", "đỏ": "Đỏ",
    "blue": "Xanh dương", "xanh": "Xanh",
    "navy": "Navy",
    "grey": "Xám", "gray": "Xám", "xám": "Xám",
    "green": "Xanh lá",
    "yellow": "Vàng", "vàng": "Vàng",
    "pink": "Hồng", "hồng": "Hồng",
    "brown": "Nâu", "nâu": "Nâu",
    "orange": "Cam", "cam": "Cam", "tím": "Tím",
    "multicolor": "Phối màu", "phối màu": "Phối màu"
}


class EntityParserComponent(OCRPipelineComponent):
    """
    Universal Multi-Category OCR Entity Parser & Dynamic Specification Window Builder.
    Rule 1: ZERO hardcoded default fallback values. Missing fields return null/None.
    Rule 2: Universal scope across Fashion, Footwear, Electronics, Cosmetics, Appliances, Invoices.
    Rule 3: Dynamic Specification Window Extractor using Start/End markers.
    """

    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        raw_text = context.raw_text or ""
        words = context.extracted_words or []
        text_upper = raw_text.upper()
        text_lower = raw_text.lower()

        # Check if text is present
        has_text = len(words) > 0 and len(raw_text.strip()) > 0

        if not has_text:
            context.entities = {
                "name": None,
                "category": None,
                "brand": None,
                "sku_barcode": None,
                "unit_price": None,
                "origin": None,
                "size_dimension": None,
                "color": None,
                "specifications": {}
            }
            context.detected_name = None
            context.detected_type = None
            context.detected_color = None
            context.detected_origin = None
            context.detected_order_code = None
            context.detected_total_amount = None
            return context

        # --- Layer 1: Heuristic Attribute Extractor ---
        brand = self._extract_brand(words, text_upper)
        sku_barcode = self._extract_sku_barcode(words, raw_text)
        unit_price = self._extract_price(raw_text)
        origin = self._extract_origin(raw_text, text_lower)
        size_dimension = self._extract_size_dimension(raw_text, text_upper)
        color = self._extract_color(text_lower)

        # --- Layer 2: Dynamic Specification Window Builder ---
        specifications = self._extract_dynamic_specifications(raw_text)

        # --- Layer 3: Dynamic Category & Name Resolution ---
        category = self._extract_category(text_lower)
        name = self._build_product_name(words, raw_text, brand, category, sku_barcode)

        # Layer 4 (Optional): Optional LLM refinement if LLM engine loaded
        try:
            from app.services.ai_core import ai_engine_core
            if hasattr(ai_engine_core, 'parse_ocr_entities') and raw_text.strip():
                llm_res = ai_engine_core.parse_ocr_entities(raw_text)
                if isinstance(llm_res, dict) and llm_res.get("status") != "error":
                    if llm_res.get("brand") and llm_res["brand"] not in ["Unbranded", "None", None]:
                        brand = llm_res["brand"]
                    if llm_res.get("product_name") and isinstance(llm_res["product_name"], str) and "không" not in llm_res["product_name"].lower():
                        name = llm_res["product_name"]
                    if llm_res.get("category") and llm_res["category"] not in ["None", None]:
                        category = llm_res["category"]
                    if llm_res.get("color") and llm_res["color"] not in ["None", None]:
                        color = llm_res["color"]
                    if llm_res.get("price") and unit_price is None:
                        try:
                            unit_price = float(llm_res["price"])
                        except ValueError:
                            pass
        except Exception as llm_err:
            logger.debug(f"[EntityParserComponent] LLM refinement skipped: {llm_err}")

        # Assemble JSON Entities Contract (Zero Hardcoded Defaults)
        entities: Dict[str, Any] = {
            "name": name,
            "category": category,
            "brand": brand,
            "sku_barcode": sku_barcode,
            "unit_price": unit_price,
            "origin": origin,
            "size_dimension": size_dimension,
            "color": color,
            "specifications": specifications
        }

        # Update context
        context.entities = entities
        context.detected_name = name
        context.detected_type = category
        context.detected_color = color
        context.detected_origin = origin
        context.detected_order_code = sku_barcode
        context.detected_total_amount = unit_price

        logger.info(f"[EntityParserComponent] Universal OCR Entities parsed: {entities}")
        return context

    # --- Layer 1 Helper Methods ---

    def _extract_brand(self, words: List[str], text_upper: str) -> Optional[str]:
        for b in _KNOWN_BRANDS:
            if re.search(rf'\b{re.escape(b)}\b', text_upper):
                return b.title()
        
        # Check initial words for brand candidate (uppercase, len >= 3)
        for w in words[:6]:
            clean_w = re.sub(r'[^\w]', '', w)
            if clean_w.isupper() and len(clean_w) >= 3 and clean_w not in ["MADE", "SIZE", "VIETNAM", "CHINA", "TEXT", "CODE"]:
                return clean_w.capitalize()

        return None

    def _extract_sku_barcode(self, words: List[str], raw_text: str) -> Optional[str]:
        # Match explicit prefix: SKU: ABC-1234, MODEL: XYZ-99, MÃ: 12345
        prefix_match = re.search(r'\b(?:SKU|MODEL|MÃ\s*SP|MÃ|CODE|BARCODE)\s*[:.-]?\s*([A-Z0-9-_/]{3,16})\b', raw_text.upper())
        if prefix_match:
            return prefix_match.group(1)

        # Match EAN-13 / UPC standalone numeric barcode (8 to 14 digits)
        barcode_match = re.search(r'\b(\d{8,14})\b', raw_text)
        if barcode_match:
            return barcode_match.group(1)

        # Match Alphanumeric SKU patterns (e.g. 370846-01, ART-12345)
        sku_pattern = re.search(r'\b([A-Z0-9]{3,8}[-_/][A-Z0-9]{2,6})\b', raw_text.upper())
        if sku_pattern:
            return sku_pattern.group(1)

        return None

    def _extract_price(self, raw_text: str) -> Optional[float]:
        # Clean currency formatted numbers (e.g., 450.000đ, 120,000 VND, $45.00)
        clean_text = (raw_text or "").lower()
        
        # Match number followed by currency suffix
        suffix_match = re.search(r'(\d{1,3}(?:[.,]\d{3})+|\d{4,8})\s*(?:vnd|vnđ|đ|d\b|k\b)', clean_text)
        if suffix_match:
            val_str = suffix_match.group(1).replace('.', '').replace(',', '')
            try:
                val = float(val_str)
                if 'k' in suffix_match.group(0) and val < 1000:
                    val *= 1000
                return val
            except ValueError:
                pass

        # Match currency prefix (e.g. $45, €100)
        prefix_match = re.search(r'(?:\$|€|£)\s*(\d+(?:\.\d{1,2})?)', clean_text)
        if prefix_match:
            try:
                return float(prefix_match.group(1))
            except ValueError:
                pass

        return None

    def _extract_origin(self, raw_text: str, text_lower: str) -> Optional[str]:
        origin_match = re.search(r'(?:made in|sản xuất tại|origin|xuất xứ)\s*[:.-]?\s*([^\n;,\/]+)', text_lower)
        if origin_match:
            return origin_match.group(1).strip().title()

        origins = ["việt nam", "vietnam", "thái lan", "thailand", "trung quốc", "china", "hàn quốc", "korea", "nhật bản", "japan", "mỹ", "usa"]
        for org in origins:
            if org in text_lower:
                return org.title()

        return None

    def _extract_size_dimension(self, raw_text: str, text_upper: str) -> Optional[str]:
        sizes = []

        # International Shoe Sizes (UK 8, EUR 42, US 9, CM 27)
        shoe_sizes = re.findall(r'\b(UK\s*\d+(?:\.\d+)?|EUR\s*\d+(?:\.\d+)?|US\s*\d+(?:\.\d+)?|CM\s*\d+(?:\.\d+)?)\b', text_upper)
        if shoe_sizes:
            sizes.extend(shoe_sizes)

        # Apparel Size letters
        apparel_match = re.search(r'\b(?:SIZE|SZ|CỠ)\s*[:.-]?\s*(XXL|2XL|3XL|XL|S|M|L)\b', text_upper)
        if apparel_match:
            sizes.append(apparel_match.group(1))

        # Dimensions / Capacity / Weight / Voltage / Power
        dim_match = re.findall(r'\b\d+(?:\.\d+)?\s*(?:ml|l|g|kg|cm|mm|m|inch|w|v|mah|gb|tb|hz)\b', (raw_text or "").lower())
        if dim_match:
            sizes.extend(dim_match[:2])

        if sizes:
            return " / ".join(sizes)

        return None

    def _extract_color(self, text_lower: str) -> Optional[str]:
        matched: List[str] = []
        for key, val in _COLOR_MAP.items():
            if re.search(rf'\b{key}\b', text_lower):
                if val not in matched:
                    matched.append(val)
        if matched:
            return " ".join(matched)
        return None

    # --- Layer 2 Helper Methods ---

    def _extract_dynamic_specifications(self, raw_text: str) -> Dict[str, str]:
        """
        Scans raw_text for Key-Value specification patterns and Start/End marker windows.
        """
        specifications: Dict[str, str] = {}
        lines = [l.strip() for l in raw_text.split('\n') if l.strip()]

        for line in lines:
            # Check explicit Key: Value pattern
            if ':' in line:
                parts = line.split(':', 1)
                k = parts[0].strip()
                v = parts[1].strip()
                if len(k) < 30 and len(v) > 0 and not k.lower().startswith(('http', 'https')):
                    clean_k = re.sub(r'[^\w\s]', '', k).strip().lower().replace(' ', '_')
                    specifications[clean_k] = v

        return specifications

    # --- Layer 3 Helper Methods ---

    def _extract_category(self, text_lower: str) -> Optional[str]:
        for cat_name, keywords in _CATEGORY_MAP.items():
            if any(re.search(rf'\b{re.escape(k)}\b', text_lower) for k in keywords):
                return cat_name
        return None

    def _build_product_name(
        self,
        words: List[str],
        raw_text: str,
        brand: Optional[str],
        category: Optional[str],
        sku: Optional[str]
    ) -> Optional[str]:
        # Clean candidates from words
        filtered = [
            w for w in words
            if not w.isdigit() and len(w) > 1 and not w.endswith(("đ", "VND", "vnd"))
            and w.upper() not in ["UK", "EUR", "US", "CM", "SIZE", "MADE", "IN", "VIETNAM", "CHINA"]
        ]

        if filtered:
            return " ".join(filtered[:6])

        if brand and category:
            return f"{brand} {category}".strip()
        elif brand:
            return f"Sản phẩm {brand}"
        elif category:
            return f"Sản phẩm {category}"
        elif sku:
            return f"Sản phẩm {sku}"

        return None
