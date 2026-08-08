from typing import List
from app.services.sql.context import SQLPipelineContext
from app.services.sql.base import SQLPipelineComponent
from app.services.sql.components.dataset_match import DatasetMatchComponent
from app.services.sql.components.llm_generate import LLMGenerateComponent
from app.services.sql.components.validator import ValidatorComponent

class SQLPipeline:
    def __init__(self, components: List[SQLPipelineComponent] = None):
        if components is None:
            self.components = [
                DatasetMatchComponent(),
                LLMGenerateComponent(),
                ValidatorComponent()
            ]
        else:
            self.components = components

    def run(self, question: str) -> SQLPipelineContext:
        context = SQLPipelineContext(question=question)
        for component in self.components:
            context = component.process(context)
            if context.status == "error":
                break
        return context

sql_pipeline = SQLPipeline()
