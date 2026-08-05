from sentence_transformers import SentenceTransformer
import logging

logger = logging.getLogger(__name__)

class EmbeddingService:
    _instance = None
    model = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(EmbeddingService, cls).__new__(cls)
        return cls._instance

    def load_model(self):
        if self.model is not None:
            return
        logger.info("🚀 Loading sentence-transformers/all-MiniLM-L6-v2 model...")
        try:
            # Load the lightweight MiniLM model (384 dimensions)
            self.model = SentenceTransformer("all-MiniLM-L6-v2")
            logger.info("✅ sentence-transformers model loaded successfully.")
        except Exception as e:
            logger.error(f"❌ Failed to load sentence-transformers: {e}")
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
            logger.error(f"Error encoding embedding: {e}")
            return [0.0] * 384

embedding_service = EmbeddingService()
