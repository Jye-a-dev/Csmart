import os
import json
import asyncio
import argparse
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

SYSTEM_PROMPT = (
    "You are CSMART AI. Convert natural language queries to Read-Only PostgreSQL SELECT statements "
    "based on Csmart schema (categories, products, users, user_addresses, orders, order_items, payments, faqs)."
)

async def export_hitl_to_jsonl_async(db_url: str, output_file: str, min_count: int = 1) -> int:
    logger.info(f"Connecting to database via asyncpg: {db_url.split('@')[-1] if '@' in db_url else db_url}")
    
    conn = None
    try:
        import asyncpg
        conn = await asyncpg.connect(dsn=db_url)
        
        query = """
            SELECT input_text, corrected_label 
            FROM ai_review_queue 
            WHERE status IN ('LABELLED', 'APPROVED') 
              AND corrected_label IS NOT NULL
              AND TRIM(corrected_label) != '';
        """
        rows = await conn.fetch(query)
        
        count = len(rows)
        logger.info(f"Found {count} labeled records in ai_review_queue.")
        
        if count < min_count:
            logger.warning(f"Record count ({count}) is less than minimum required threshold ({min_count}). Export skipped.")
            return 0
            
        dataset = []
        for row in rows:
            input_text = row["input_text"] or ""
            corrected_sql = row["corrected_label"] or ""
            
            assistant_content = json.dumps({
                "generated_sql": corrected_sql,
                "is_read_only": True
            }, ensure_ascii=False)
            
            item = {
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": input_text},
                    {"role": "assistant", "content": assistant_content}
                ]
            }
            dataset.append(item)
            
        out_dir = os.path.dirname(os.path.abspath(output_file))
        if out_dir:
            os.makedirs(out_dir, exist_ok=True)
            
        with open(output_file, "w", encoding="utf-8") as f:
            for entry in dataset:
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")
                
        logger.info(f"✅ Successfully exported {len(dataset)} items to {output_file}")
        return len(dataset)
        
    except Exception as e:
        logger.error(f"❌ Error exporting HITL dataset: {e}")
        return 0
    finally:
        if conn:
            await conn.close()

def export_hitl_to_jsonl(db_url: str, output_file: str, min_count: int = 1) -> int:
    return asyncio.run(export_hitl_to_jsonl_async(db_url, output_file, min_count))

if __name__ == "__main__":
    default_db = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/csmart_db")
    
    parser = argparse.ArgumentParser(description="Export HITL reviewed dataset to ChatML JSONL format.")
    parser.add_argument("--db-url", type=str, default=default_db, help="PostgreSQL connection URL")
    parser.add_argument("--output", "-o", type=str, default="pipeline_ai/datasets/dataset_hitl_updated.jsonl", help="Output JSONL file path")
    parser.add_argument("--min-count", "-m", type=int, default=1, help="Minimum threshold count to export")
    
    args = parser.parse_args()
    export_hitl_to_jsonl(args.db_url, args.output, args.min_count)
