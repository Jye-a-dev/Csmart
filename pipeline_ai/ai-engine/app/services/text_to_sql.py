import os
import json
import re
import logging
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ViText2SQLService:
    _instance = None
    dataset = []

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ViText2SQLService, cls).__new__(cls)
        return cls._instance

    def _clean_text(self, text: str) -> str:
        text = text.lower().strip()
        text = re.sub(r'[^\w\s]', ' ', text)
        return text

    def load_dataset(self):
        if self.dataset:
            return
        
        logger.info("Loading ViText2SQL dataset...")
        data_dir = settings.VITEXT2SQL_DATA_DIR
        dev_path = os.path.join(data_dir, "dev.json")
        train_path = os.path.join(data_dir, "train.json")

        loaded_items = []
        
        # Load dev.json
        if os.path.exists(dev_path):
            try:
                with open(dev_path, "r", encoding="utf-8") as f:
                    dev_data = json.load(f)
                    for item in dev_data:
                        cleaned = self._clean_text(item["question"])
                        loaded_items.append({
                            "question": item["question"],
                            "tokens": set(cleaned.split()),
                            "query": item["query"]
                        })
                logger.info(f"Loaded dev.json from ViText2SQL ({len(dev_data)} items)")
            except Exception as e:
                logger.error(f"Error loading dev.json: {e}")
        else:
            logger.warning(f"dev.json not found at {dev_path}")

        # Load train.json
        if os.path.exists(train_path):
            try:
                with open(train_path, "r", encoding="utf-8") as f:
                    train_data = json.load(f)
                    for item in train_data:
                        cleaned = self._clean_text(item["question"])
                        loaded_items.append({
                            "question": item["question"],
                            "tokens": set(cleaned.split()),
                            "query": item["query"]
                        })
                logger.info(f"Loaded train.json from ViText2SQL ({len(train_data)} items)")
            except Exception as e:
                logger.error(f"Error loading train.json: {e}")
        else:
            logger.warning(f"train.json not found at {train_path}")

        self.dataset = loaded_items
        logger.info(f"ViText2SQL dataset initialization complete. Total items: {len(self.dataset)}")

    def translate(self, question: str) -> str:
        query, _ = self.translate_with_score(question)
        return query

    def translate_with_score(self, question: str) -> tuple[str, float]:
        if not self.dataset:
            logger.warning("ViText2SQL dataset is empty. Returning default query.")
            return "SELECT * FROM products LIMIT 10;", 0.0

        cleaned_query = self._clean_text(question)
        query_tokens = set(cleaned_query.split())
        
        if not query_tokens:
            return "SELECT * FROM products LIMIT 10;", 0.0

        best_match = None
        best_sim = 0.0

        for item in self.dataset:
            a = query_tokens
            b = item["tokens"]
            c = a.intersection(b)
            
            # Jaccard similarity
            sim = float(len(c)) / (len(a) + len(b) - len(c)) if (len(a) + len(b) - len(c)) > 0 else 0.0
            if sim > best_sim:
                best_sim = sim
                best_match = item

        # If similarity threshold is too low (e.g. < 0.15), return a default fallback query
        if best_match and best_sim >= 0.15:
            return best_match["query"], best_sim
        else:
            # Fallback mapper for custom queries
            if "hủy nhiều nhất" in cleaned_query:
                query = """
                    SELECT p.id, p.name, COUNT(o.id) as cancel_count 
                    FROM products p 
                    JOIN order_items oi ON p.id = oi.product_id 
                    JOIN orders o ON oi.order_id = o.id 
                    WHERE o.status = 'CANCELLED' 
                    GROUP BY p.id, p.name 
                    ORDER BY cancel_count DESC LIMIT 3;
                """.strip()
                return query, 0.85
            return "SELECT * FROM products LIMIT 10;", 0.0

vitext2sql_service = ViText2SQLService()
