from abc import ABC, abstractmethod
from app.services.intent.context import IntentPipelineContext

class IntentPipelineComponent(ABC):
    @abstractmethod
    def process(self, context: IntentPipelineContext) -> IntentPipelineContext:
        pass
