from abc import ABC, abstractmethod
import logging

class BaseAIService(ABC):
    """
    Abstract Base Class cho tất cả các AI Services trong Python Pipeline.
    Đảm bảo tính nhất quán về Logging, Health Status và Lifecycle Management.
    """
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.logger = logging.getLogger(service_name)

    @abstractmethod
    def health_check(self) -> dict:
        """Trả về trạng thái sức khỏe và độ sẵn sàng của Service."""
        pass

    def log_info(self, message: str):
        self.logger.info(f"[{self.service_name}] {message}")

    def log_error(self, message: str, exc: Exception = None):
        if exc:
            self.logger.error(f"[{self.service_name}] {message}: {exc}", exc_info=True)
        else:
            self.logger.error(f"[{self.service_name}] {message}")
