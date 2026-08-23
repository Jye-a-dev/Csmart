import logging
from app.services.base_service import BaseAIService

logger = logging.getLogger(__name__)

class SelfEvaluationEngine(BaseAIService):
    def __init__(self, confidence_threshold: float = 0.75):
        super().__init__("SelfEvaluationEngine")
        self.threshold = confidence_threshold

    def health_check(self) -> dict:
        return {
            "service": self.service_name,
            "status": "healthy",
            "threshold": self.threshold
        }

    def evaluate_and_adjust(self, logs: list) -> dict:
        """
        Tính accuracy thực tế bằng cách kết hợp:
        1. HITL human corrections (ưu tiên cao nhất)
        2. confidence_score < threshold → OOD
        3. flag_for_review = True → OOD
        """
        if not logs:
            return {
                "current_accuracy": 1.0,
                "ood_count": 0,
                "total_samples": 0,
                "recommended_adjustment": {}
            }

        self.log_info(f"Evaluating {len(logs)} log records...")
        total = len(logs)
        correct_count = 0
        ood_samples = []

        for log in logs:
            conf = float(log.get("confidence_score") or 0.0)
            flagged = bool(log.get("flag_for_review", False))
            user_correction = log.get("user_corrected_intent")
            output_json = log.get("output_json") or {}

            # Trường hợp 1: Có gán nhãn thủ công từ HITL — source of truth
            if user_correction is not None:
                predicted = output_json.get("intent") or output_json.get("predicted_intent")
                if user_correction == predicted:
                    correct_count += 1
                else:
                    ood_samples.append(log)
            # Trường hợp 2: Không có human correction → dùng confidence + flag làm proxy
            elif conf >= self.threshold and not flagged:
                correct_count += 1
            else:
                ood_samples.append(log)

        accuracy = round(correct_count / total, 4) if total > 0 else 1.0
        ood_count = len(ood_samples)

        # Khuyến nghị điều chỉnh
        adjustments: dict = {}
        if accuracy < 0.80:
            new_threshold = min(self.threshold + 0.05, 0.90)
            adjustments["action"] = "UPDATE_THRESHOLD"
            adjustments["new_threshold"] = new_threshold
            adjustments["reason"] = f"Accuracy {accuracy:.1%} dưới ngưỡng 80%. Cân nhắc fine-tune NER/Intent."
        elif ood_count > int(total * 0.30):
            adjustments["action"] = "TRIGGER_RETRAIN"
            adjustments["new_samples_count"] = ood_count
            adjustments["reason"] = f"OOD rate cao ({ood_count}/{total}). Review HITL queue."

        return {
            "current_accuracy": accuracy,
            "ood_count": ood_count,
            "total_samples": total,
            "recommended_adjustment": adjustments
        }


async def log_request(endpoint: str, input_data: dict, output_data: dict, execution_time_ms: int = None):
    """Centralized logging is handled by NestJS AiProxyService to prevent duplicate log records."""
    return


