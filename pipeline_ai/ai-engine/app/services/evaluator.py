import json
import logging
from app.services.database import db_service

logger = logging.getLogger(__name__)

class SelfEvaluationEngine:
    def __init__(self, confidence_threshold=0.7):
        self.threshold = confidence_threshold

    def evaluate_and_adjust(self, logs: list):
        ood_samples = []
        correct_count = 0

        for log in logs:
            conf = log.get("confidence_score")
            if conf is None:
                output = log.get("output_json") or {}
                conf = output.get("confidence_score", 1.0)

            if conf < self.threshold:
                ood_samples.append(log)
            
            output_json = log.get("output_json") or {}
            # If user explicitly corrected the result
            if "user_corrected_intent" in log:
                if log["user_corrected_intent"] == output_json.get("predicted_intent"):
                    correct_count += 1
            # Or if no corrections were recorded, treat as correct
            else:
                correct_count += 1

        accuracy = correct_count / len(logs) if logs else 1.0

        # Adjustments logic
        adjustments = {}
        if accuracy < 0.80:
            new_threshold = min(self.threshold + 0.05, 0.90)
            adjustments["action"] = "UPDATE_THRESHOLD"
            adjustments["new_threshold"] = new_threshold
        elif len(ood_samples) > 100:
            adjustments["action"] = "TRIGGER_RETRAIN"
            adjustments["new_samples_count"] = len(ood_samples)

        return {
            "current_accuracy": accuracy,
            "ood_count": len(ood_samples),
            "recommended_adjustment": adjustments
        }

async def log_request(endpoint: str, input_data: dict, output_data: dict, execution_time_ms: int = None):
    try:
        # Extract inputs to log
        input_text = (
            input_data.get("question") 
            or input_data.get("query") 
            or input_data.get("text") 
            or input_data.get("filename")
            or ""
        )
        confidence_score = output_data.get("confidence_score")
        flag_for_review = output_data.get("flag_for_review", False)

        query = """
            INSERT INTO ai_request_logs (
                endpoint, user_id, input_text, output_json, 
                confidence_score, flag_for_review, execution_time_ms
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """
        await db_service.execute(
            query,
            endpoint,
            None,  # user_id is None since we don't have user authentication in AI engine yet
            input_text,
            json.dumps(output_data),
            confidence_score,
            flag_for_review,
            execution_time_ms
        )
        logger.info(f"Successfully logged AI request to database: {endpoint}")
    except Exception as e:
        logger.error(f"Failed to write request log to database: {e}")
