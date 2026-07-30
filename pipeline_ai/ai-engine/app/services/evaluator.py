import os
import json
import logging

logger = logging.getLogger(__name__)

class SelfEvaluationEngine:
    def __init__(self, confidence_threshold=0.7):
        self.threshold = confidence_threshold

    def evaluate_and_adjust(self, logs: list):
        ood_samples = []
        correct_count = 0

        for log in logs:
            if log.get("confidence_score", 1.0) < self.threshold:
                ood_samples.append(log)
            
            # If user explicitly corrected the result
            if "user_corrected_intent" in log:
                if log["user_corrected_intent"] == log.get("predicted_intent"):
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

# Logger setup to write requests directly to local JSON logs for auditing and self-evaluation
LOG_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "requests_log.json")

def log_request(endpoint: str, input_data: dict, output_data: dict):
    try:
        os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
        logs = []
        if os.path.exists(LOG_FILE):
            try:
                with open(LOG_FILE, "r", encoding="utf-8") as f:
                    logs = json.load(f)
            except Exception:
                logs = []
        
        log_entry = {
            "endpoint": endpoint,
            "input": input_data,
            "output": output_data,
            "confidence_score": output_data.get("confidence_score", 1.0)
        }
        logs.append(log_entry)
        
        # Limit local logs to latest 1000 items to prevent unbounded file growth
        if len(logs) > 1000:
            logs = logs[-1000:]
            
        with open(LOG_FILE, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=4, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Failed to write request log: {e}")
