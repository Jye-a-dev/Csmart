import os
import time
import logging
import argparse
from export_hitl_dataset import export_hitl_to_jsonl

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

def run_cron_exporter(db_url: str, output_file: str, threshold: int, interval_seconds: int):
    logger.info(f"🚀 Starting HITL Continuous Learning Exporter Cron (Threshold: {threshold}, Interval: {interval_seconds}s)")
    try:
        while True:
            logger.info("Checking ai_review_queue status...")
            exported = export_hitl_to_jsonl(db_url, output_file, min_count=threshold)
            if exported >= threshold:
                logger.info(f"🔥 Active Learning trigger threshold reached! ({exported} records exported). Ready for LoRA fine-tuning.")
            time.sleep(interval_seconds)
    except KeyboardInterrupt:
        logger.info("Stopping HITL Exporter Cron.")

if __name__ == "__main__":
    default_db = os.environ.get("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/csmart_db")
    
    parser = argparse.ArgumentParser(description="Cron / Worker monitoring HITL dataset thresholds.")
    parser.add_argument("--db-url", type=str, default=default_db, help="PostgreSQL connection URL")
    parser.add_argument("--output", "-o", type=str, default="pipeline_ai/datasets/dataset_hitl_updated.jsonl", help="Output JSONL file path")
    parser.add_argument("--threshold", "-t", type=int, default=100, help="Record count threshold to trigger dataset export")
    parser.add_argument("--interval", "-i", type=int, default=300, help="Check interval in seconds (default: 300s)")
    
    args = parser.parse_args()
    run_cron_exporter(args.db_url, args.output, args.threshold, args.interval)
