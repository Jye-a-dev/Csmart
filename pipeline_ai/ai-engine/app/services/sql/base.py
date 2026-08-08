from abc import ABC, abstractmethod
from app.services.sql.context import SQLPipelineContext

class SQLPipelineComponent(ABC):
    @abstractmethod
    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        pass
