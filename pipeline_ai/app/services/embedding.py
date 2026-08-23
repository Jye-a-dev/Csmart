from sentence_transformers import SentenceTransformer
from app.services.base_service import BaseAIService

class EmbeddingService(BaseAIService):
    _instance = None
    model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "_initialized"):
            super().__init__("EmbeddingService")
            self._initialized = True

    def health_check(self) -> dict:
        return {
            "service": self.service_name,
            "status": "loaded" if self.model is not None else "not_loaded",
            "model_name": "all-MiniLM-L6-v2"
        }

    def load_model(self):
        if self.model is not None:
            return
        self.log_info("Loading sentence-transformers/all-MiniLM-L6-v2 model...")
        try:
            # Load the lightweight MiniLM model (384 dimensions)
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
            self.log_info("sentence-transformers model loaded successfully.")
        except Exception as e:
            self.log_error("Failed to load sentence-transformers", e)
            self.model = None

    def get_embedding(self, text: str) -> list[float]:
        if self.model is None:
            self.load_model()
        if self.model is None:
            # Fallback if model load failed
            return [0.0] * 384
        try:
            embedding = self.model.encode(text)
            return embedding.tolist()
        except Exception as e:
            self.log_error("Error encoding embedding", e)
            return [0.0] * 384

embedding_service = EmbeddingService()

