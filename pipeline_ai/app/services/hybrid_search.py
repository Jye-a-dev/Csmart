from abc import ABC, abstractmethod
from app.services.base_service import BaseAIService
from app.services.database import db_service
from app.services.embedding import embedding_service

class ISearchStrategy(ABC):
    @abstractmethod
    def build_query(self, query: str, query_vector: list[float], limit: int) -> tuple[str, list]:
        pass

class PgVectorHybridSearchStrategy(ISearchStrategy):
    def build_query(self, query: str, query_vector: list[float], limit: int) -> tuple[str, list]:
        sql = """
            WITH semantic_search AS (
                SELECT 
                    id, name, sku, base_price, discount_price, stock_quantity, status, description,
                    (1 - (embedding <=> $1)) as semantic_score
                FROM products
                WHERE is_published = TRUE
                ORDER BY embedding <=> $1
                LIMIT 50
            ),
            keyword_search AS (
                SELECT 
                    id, name, sku, base_price, discount_price, stock_quantity, status, description,
                    CASE 
                        WHEN name ILIKE $2 THEN 1.0
                        WHEN description ILIKE $2 THEN 0.5
                        ELSE 0.0
                    END as keyword_score
                FROM products
                WHERE is_published = TRUE AND (name ILIKE $2 OR description ILIKE $2)
                LIMIT 50
            )
            SELECT 
                COALESCE(s.id, k.id) as id,
                COALESCE(s.name, k.name) as name,
                COALESCE(s.sku, k.sku) as sku,
                COALESCE(s.base_price, k.base_price) as base_price,
                COALESCE(s.discount_price, k.discount_price) as discount_price,
                COALESCE(s.stock_quantity, k.stock_quantity) as stock_quantity,
                COALESCE(s.status, k.status) as status,
                COALESCE(s.description, k.description) as description,
                COALESCE(s.semantic_score, 0.0) as semantic_score,
                COALESCE(k.keyword_score, 0.0) as keyword_score,
                (COALESCE(s.semantic_score, 0.0) * 0.7 + COALESCE(k.keyword_score, 0.0) * 0.3) as combined_score
            FROM semantic_search s
            FULL OUTER JOIN keyword_search k ON s.id = k.id
            ORDER BY combined_score DESC
            LIMIT $3;
        """
        params = [query_vector, f"%{query}%", limit]
        return sql, params

class KeywordFallbackSearchStrategy(ISearchStrategy):
    def build_query(self, query: str, query_vector: list[float], limit: int) -> tuple[str, list]:
        sql = """
            SELECT 
                id, name, sku, base_price, discount_price, stock_quantity, status, description,
                0.0 as semantic_score,
                CASE 
                    WHEN name ILIKE $1 THEN 1.0
                    WHEN description ILIKE $1 THEN 0.5
                    ELSE 0.0
                END as keyword_score,
                CASE 
                    WHEN name ILIKE $1 THEN 1.0
                    WHEN description ILIKE $1 THEN 0.5
                    ELSE 0.0
                END as combined_score
            FROM products
            WHERE is_published = TRUE AND (name ILIKE $1 OR description ILIKE $1)
            ORDER BY combined_score DESC
            LIMIT $2;
        """
        params = [f"%{query}%", limit]
        return sql, params

class HybridSearchService(BaseAIService):
    def __init__(self):
        super().__init__("HybridSearchService")
        self._pg_vector_strategy = PgVectorHybridSearchStrategy()
        self._keyword_strategy = KeywordFallbackSearchStrategy()

    def health_check(self) -> dict:
        return {
            "service": self.service_name,
            "status": "healthy"
        }

    async def search(self, query: str, limit: int = 10) -> list[dict]:
        self.log_info(f"Performing hybrid search for: '{query}'")
        
        # 1. Generate text embedding
        query_vector = embedding_service.get_embedding(query)

        # 2. Check if pgvector is enabled and working
        has_vector = False
        try:
            await db_service.fetch("SELECT embedding <=> $1 FROM products LIMIT 1", query_vector)
            has_vector = True
        except Exception:
            has_vector = False

        # 3. Choose strategy
        strategy = self._pg_vector_strategy if has_vector else self._keyword_strategy
        sql, params = strategy.build_query(query, query_vector, limit)

        try:
            rows = await db_service.fetch(sql, *params)
            results = []
            for r in rows:
                results.append({
                    "id": r["id"],
                    "name": r["name"],
                    "sku": r["sku"],
                    "base_price": float(r["base_price"]),
                    "discount_price": float(r["discount_price"]) if r["discount_price"] else None,
                    "stock_quantity": r["stock_quantity"],
                    "status": r["status"],
                    "description": r["description"],
                    "semantic_score": float(r["semantic_score"]),
                    "keyword_score": float(r["keyword_score"]),
                    "combined_score": float(r["combined_score"]),
                })
            return results
        except Exception as e:
            self.log_error(f"Error executing hybrid search SQL", e)
            return []

    async def update_product_embedding(self, product_id: int, name: str, description: str):
        """Generates embedding for a product and updates the database."""
        text_to_embed = f"{name} {description or ''}"
        vector = embedding_service.get_embedding(text_to_embed)
        try:
            await db_service.execute(
                "UPDATE products SET embedding = $1 WHERE id = $2",
                vector, product_id
            )
            self.log_info(f"Updated vector embedding for product ID: {product_id}")
        except Exception as e:
            self.log_error(f"Failed to update vector embedding for product ID {product_id}", e)

    async def backfill_embeddings(self):
        """Regenerates embeddings for all products that lack them."""
        try:
            rows = await db_service.fetch("SELECT id, name, description FROM products WHERE embedding IS NULL")
            if not rows:
                self.log_info("No products need embedding backfill.")
                return
            self.log_info(f"Backfilling vector embeddings for {len(rows)} products...")
            for r in rows:
                await self.update_product_embedding(r["id"], r["name"], r["description"])
            self.log_info("Completed embedding backfill.")
        except Exception as e:
            self.logger.warning(f"Embedding backfill failed (likely pgvector is not setup): {e}")

hybrid_search_service = HybridSearchService()

