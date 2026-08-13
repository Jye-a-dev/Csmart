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
    """Centralized logging is handled by NestJS AiProxyService to prevent duplicate log records."""
    return
