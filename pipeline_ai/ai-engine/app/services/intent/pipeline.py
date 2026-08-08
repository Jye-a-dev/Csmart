from typing import List
from app.services.intent.context import IntentPipelineContext
from app.services.intent.base import IntentPipelineComponent
from app.services.intent.components.keyword_matcher import KeywordMatcherComponent
from app.services.intent.components.llm_classifier import LLMClassifierComponent
from app.services.intent.components.scorer import ScorerComponent

class IntentPipeline:
    def __init__(self, components: List[IntentPipelineComponent] = None):
        if components is None:
            self.components = [
                KeywordMatcherComponent(),
                LLMClassifierComponent(),
                ScorerComponent()
            ]
        else:
            self.components = components

    def run(self, query: str) -> IntentPipelineContext:
        context = IntentPipelineContext(query=query)
        for component in self.components:
            context = component.process(context)
            if context.status == "error":
                break
        return context

intent_pipeline = IntentPipeline()
