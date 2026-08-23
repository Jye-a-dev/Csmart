import re
import logging
import numpy as np
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional, Tuple
from pydantic import BaseModel, Field
from app.core.model_loader import model_loader
from app.services.hybrid_search import hybrid_search_service

logger = logging.getLogger(__name__)

# Attempt to import cv2 safely
try:
    import cv2
except ImportError:
    cv2 = None
    logger.warning("[ImagePreprocessComponent] OpenCV (cv2) is not installed. Passing raw image.")

class OCRPipelineContext(BaseModel):
    image_np: Any = None
    image_path: Optional[str] = None
    image_bytes: Optional[bytes] = None
    processed_image_np: Any = None
    extracted_words: List[str] = []
    raw_text: str = ""
    document_type: Optional[str] = None
    entities: Dict[str, Any] = Field(default_factory=dict)
    detected_color: Optional[str] = None
    detected_type: Optional[str] = None
    detected_origin: Optional[str] = None
    detected_name: Optional[str] = None
    detected_order_code: Optional[str] = None
    detected_customer_name: Optional[str] = None
    detected_phone_number: Optional[str] = None
    detected_address: Optional[str] = None
    detected_total_amount: Optional[float] = None
    similar_products: List[Dict[str, Any]] = []
    confidence_score: float = 0.0
    flag_for_review: bool = True
    is_fallback: bool = False
    status: str = "success"
    error_message: Optional[str] = None

class OCRPipelineComponent(ABC):
    @abstractmethod
    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        pass

class ImagePreprocessComponent(OCRPipelineComponent):
    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        input_img = context.image_np
        image_bytes = context.image_bytes
        image_path = context.image_path

        img_bgr: Any = None

        if cv2 is not None:
            try:
                if image_path:
                    img_bgr = cv2.imread(image_path)
                elif image_bytes is not None:
                    nparr = np.frombuffer(image_bytes, np.uint8)
                    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                elif input_img is not None:
                    if isinstance(input_img, np.ndarray):
                        if len(input_img.shape) == 3 and input_img.shape[2] == 3:
                            img_bgr = cv2.cvtColor(input_img, cv2.COLOR_RGB2BGR)
                        else:
                            img_bgr = input_img
            except Exception as e:
                logger.warning(f"[ImagePreprocessComponent] OpenCV decode failed: {e}")

        if img_bgr is None:
            context.processed_image_np = context.image_np
            return context

        try:
            h, w = img_bgr.shape[:2]
            if w < 1600:
                scale = 1600.0 / w
                img_bgr = cv2.resize(img_bgr, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

            img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
            context.processed_image_np = img_rgb
            logger.info("[ImagePreprocessComponent] Image upscaled to 3-channel RGB successfully.")
        except Exception as e:
            logger.warning(f"[ImagePreprocessComponent] Preprocessing error: {e}")
            context.processed_image_np = context.image_np

        return context

class OCRInferenceComponent(OCRPipelineComponent):
    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        reader = model_loader.ocr_reader

        if reader is None:
            logger.warning("[OCRInferenceComponent] EasyOCR Reader is None.")
            context.extracted_words = []
            context.raw_text = ""
            context.confidence_score = 0.0
            context.flag_for_review = True
            context.is_fallback = True
            context.status = "success"
            return context

        input_image: Any = context.processed_image_np if context.processed_image_np is not None else context.image_np

        if input_image is None:
            logger.warning("[OCRInferenceComponent] No valid image input provided.")
            context.extracted_words = []
            context.raw_text = ""
            context.confidence_score = 0.0
            context.flag_for_review = True
            context.is_fallback = True
            context.status = "success"
            return context

        try:
            results: List[Tuple[Any, str, float]] = reader.readtext(
                input_image,
                detail=1,
                paragraph=False,
                mag_ratio=2.0,
                text_threshold=0.25,
                low_text=0.25,
                link_threshold=0.25,
                canvas_size=2560
            )

            extracted_words: List[str] = []
            confidence_scores: List[float] = []

            for _bbox, text, prob in results:
                cleaned_text = text.strip() if text else ""
                if cleaned_text and cleaned_text not in extracted_words:
                    extracted_words.append(cleaned_text)
                    confidence_scores.append(float(prob))

            if len(extracted_words) < 3 and isinstance(input_image, np.ndarray):
                try:
                    h, w = input_image.shape[:2]
                    top_left_crop = input_image[0:int(h * 0.45), 0:int(w * 0.45)]
                    crop_results = reader.readtext(
                        top_left_crop,
                        detail=1,
                        paragraph=False,
                        mag_ratio=2.5,
                        text_threshold=0.20,
                        low_text=0.20
                    )
                    for _bbox, text, prob in crop_results:
                        cleaned_text = text.strip() if text else ""
                        if cleaned_text and cleaned_text not in extracted_words:
                            extracted_words.append(cleaned_text)
                            confidence_scores.append(float(prob))
                except Exception as crop_err:
                    logger.warning(f"[OCRInferenceComponent] Crop scan exception: {crop_err}")

            avg_confidence = round(sum(confidence_scores) / len(confidence_scores), 2) if confidence_scores else 0.0
            raw_text = " ".join(extracted_words)

            context.extracted_words = extracted_words
            context.raw_text = raw_text
            context.confidence_score = avg_confidence
            context.flag_for_review = (avg_confidence < 0.65) or (len(extracted_words) == 0)
            context.is_fallback = False
            context.status = "success"

        except Exception as e:
            logger.error(f"[OCRInferenceComponent] EasyOCR execution failed: {e}")
            context.extracted_words = []
            context.raw_text = ""
            context.confidence_score = 0.0
            context.flag_for_review = True
            context.is_fallback = True
            context.status = "success"
            context.error_message = str(e)

        return context

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

_COLOR_MAP = {
    "white": "Trắng", "trắng": "Trắng", "black": "Đen", "đen": "Đen",
    "red": "Đỏ", "đỏ": "Đỏ", "blue": "Xanh dương", "xanh": "Xanh",
    "navy": "Navy", "grey": "Xám", "gray": "Xám", "xám": "Xám",
    "green": "Xanh lá", "yellow": "Vàng", "vàng": "Vàng", "pink": "Hồng", "hồng": "Hồng",
    "brown": "Nâu", "nâu": "Nâu", "orange": "Cam", "cam": "Cam", "tím": "Tím",
    "multicolor": "Phối màu", "phối màu": "Phối màu"
}

class EntityParserComponent(OCRPipelineComponent):
    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        raw_text = context.raw_text or ""
        words = context.extracted_words or []
        text_upper = raw_text.upper()
        text_lower = raw_text.lower()

        has_text = len(words) > 0 and len(raw_text.strip()) > 0

        if not has_text:
            context.entities = {
                "name": None, "category": None, "brand": None,
                "sku_barcode": None, "unit_price": None, "origin": None,
                "size_dimension": None, "color": None, "specifications": {}
            }
            context.detected_name = None
            context.detected_type = None
            context.detected_color = None
            context.detected_origin = None
            context.detected_order_code = None
            context.detected_total_amount = None
            return context

        brand = self._extract_brand(words, text_upper)
        sku_barcode = self._extract_sku_barcode(words, raw_text)
        unit_price = self._extract_price(raw_text)
        origin = self._extract_origin(raw_text, text_lower)
        size_dimension = self._extract_size_dimension(raw_text, text_upper)
        color = self._extract_color(text_lower)
        specifications = self._extract_dynamic_specifications(raw_text)
        category = self._extract_category(text_lower)
        name = self._build_product_name(words, raw_text, brand, category, sku_barcode)

        # Optional LLM refinement
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

        context.entities = entities
        context.detected_name = name
        context.detected_type = category
        context.detected_color = color
        context.detected_origin = origin
        context.detected_order_code = sku_barcode
        context.detected_total_amount = unit_price
        return context

    def _extract_brand(self, words: List[str], text_upper: str) -> Optional[str]:
        for b in _KNOWN_BRANDS:
            if re.search(rf'\b{re.escape(b)}\b', text_upper):
                return b.title()
        for w in words[:6]:
            clean_w = re.sub(r'[^\w]', '', w)
            if clean_w.isupper() and len(clean_w) >= 3 and clean_w not in ["MADE", "SIZE", "VIETNAM", "CHINA", "TEXT", "CODE"]:
                return clean_w.capitalize()
        return None

    def _extract_sku_barcode(self, words: List[str], raw_text: str) -> Optional[str]:
        prefix_match = re.search(r'\b(?:SKU|MODEL|MÃ\s*SP|MÃ|CODE|BARCODE)\s*[:.-]?\s*([A-Z0-9-_/]{3,16})\b', raw_text.upper())
        if prefix_match:
            return prefix_match.group(1)
        barcode_match = re.search(r'\b(\d{8,14})\b', raw_text)
        if barcode_match:
            return barcode_match.group(1)
        sku_pattern = re.search(r'\b([A-Z0-9]{3,8}[-_/][A-Z0-9]{2,6})\b', raw_text.upper())
        if sku_pattern:
            return sku_pattern.group(1)
        return None

    def _extract_price(self, raw_text: str) -> Optional[float]:
        clean_text = (raw_text or "").lower()
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
        shoe_sizes = re.findall(r'\b(UK\s*\d+(?:\.\d+)?|EUR\s*\d+(?:\.\d+)?|US\s*\d+(?:\.\d+)?|CM\s*\d+(?:\.\d+)?)\b', text_upper)
        if shoe_sizes:
            sizes.extend(shoe_sizes)
        apparel_match = re.search(r'\b(?:SIZE|SZ|CỠ)\s*[:.-]?\s*(XXL|2XL|3XL|XL|S|M|L)\b', text_upper)
        if apparel_match:
            sizes.append(apparel_match.group(1))
        dim_match = re.findall(r'\b\d+(?:\.\d+)?\s*(?:ml|l|g|kg|cm|mm|m|inch|w|v|mah|gb|tb|hz)\b', (raw_text or "").lower())
        if dim_match:
            sizes.extend(dim_match[:2])
        return " / ".join(sizes) if sizes else None

    def _extract_color(self, text_lower: str) -> Optional[str]:
        matched: List[str] = []
        for key, val in _COLOR_MAP.items():
            if re.search(rf'\b{key}\b', text_lower):
                if val not in matched:
                    matched.append(val)
        return " ".join(matched) if matched else None

    def _extract_dynamic_specifications(self, raw_text: str) -> Dict[str, str]:
        specifications: Dict[str, str] = {}
        lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
        for line in lines:
            if ':' in line:
                parts = line.split(':', 1)
                k, v = parts[0].strip(), parts[1].strip()
                if len(k) < 30 and len(v) > 0 and not k.lower().startswith(('http', 'https')):
                    clean_k = re.sub(r'[^\w\s]', '', k).strip().lower().replace(' ', '_')
                    specifications[clean_k] = v
        return specifications

    def _extract_category(self, text_lower: str) -> Optional[str]:
        for cat_name, keywords in _CATEGORY_MAP.items():
            if any(re.search(rf'\b{re.escape(k)}\b', text_lower) for k in keywords):
                return cat_name
        return None

    def _build_product_name(self, words: List[str], raw_text: str, brand: Optional[str], category: Optional[str], sku: Optional[str]) -> Optional[str]:
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

class ProductMatcherComponent(OCRPipelineComponent):
    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        det_type = context.detected_type or ""
        det_color = (context.detected_color or "").lower()
        search_query = f"{det_type} {det_color}".strip()

        if not search_query:
            context.similar_products = []
            return context

        try:
            similar_products = await hybrid_search_service.search(search_query, limit=5)
            context.similar_products = similar_products
        except Exception:
            context.similar_products = []
        return context

class OCRScorerComponent(OCRPipelineComponent):
    async def process(self, context: OCRPipelineContext) -> OCRPipelineContext:
        context.confidence_score = 0.90 if context.extracted_words else 0.20
        context.flag_for_review = context.confidence_score < 0.50
        return context

class OCRPipeline:
    def __init__(self, components: List[OCRPipelineComponent] = None):
        if components is None:
            self.components = [
                ImagePreprocessComponent(),
                OCRInferenceComponent(),
                EntityParserComponent(),
                ProductMatcherComponent(),
                OCRScorerComponent()
            ]
        else:
            self.components = components

    async def run(self, image_np: Any = None, image_bytes: Optional[bytes] = None, image_path: Optional[str] = None) -> OCRPipelineContext:
        context = OCRPipelineContext(image_np=image_np, image_bytes=image_bytes, image_path=image_path)
        for component in self.components:
            context = await component.process(context)
            if context.status == "error":
                break
        return context

ocr_pipeline = OCRPipeline()
