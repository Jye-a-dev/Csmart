import asyncpg
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class DatabaseService:
    _instance = None
    pool: asyncpg.Pool = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(DatabaseService, cls).__new__(cls)
        return cls._instance

    async def connect(self):
        if self.pool is not None:
            return
        logger.info("Connecting to PostgreSQL database...")
        try:
            self.pool = await asyncpg.create_pool(
                dsn=settings.DATABASE_URL,
                min_size=1,
                max_size=10
            )
            logger.info("PostgreSQL database connection pool established successfully")
            
            # Setup pgvector and embedding columns dynamically
            async with self.pool.acquire() as conn:
                try:
                    await conn.execute("CREATE EXTENSION IF NOT EXISTS vector;")
                    await conn.execute("ALTER TABLE products ADD COLUMN IF NOT EXISTS embedding vector(384);")
                    logger.info("Successfully verified pgvector extension and products embedding column")
                except Exception as ext_err:
                    logger.warning(f"Could not initialize pgvector in PostgreSQL: {ext_err}. Hybrid Search will fall back to keyword matching.")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise e

    async def disconnect(self):
        if self.pool is not None:
            await self.pool.close()
            self.pool = None
            logger.info("PostgreSQL database connection pool closed")

    async def fetch(self, query: str, *args):
        if self.pool is None:
            raise RuntimeError("Database pool is not initialized")
        async with self.pool.acquire() as connection:
            return await connection.fetch(query, *args)

    async def execute(self, query: str, *args):
        if self.pool is None:
            raise RuntimeError("Database pool is not initialized")
        async with self.pool.acquire() as connection:
            return await connection.execute(query, *args)

db_service = DatabaseService()
