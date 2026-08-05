from typing import List
from app.services.ner.context import PipelineContext
from app.services.ner.base import PipelineComponent
from app.services.ner.components.order_id import OrderIDExtractorComponent
from app.services.ner.components.intent import IntentClassifierComponent
from app.services.ner.components.address import AddressExtractorComponent
from app.services.ner.components.confidence import ConfidenceScorerComponent

class NERPipeline:
    def __init__(self, components: List[PipelineComponent] = None):
        if components is None:
            self.components = [
                OrderIDExtractorComponent(),
                IntentClassifierComponent(),
                AddressExtractorComponent(),
                ConfidenceScorerComponent()
            ]
        else:
            self.components = components

    def run(self, text: str) -> PipelineContext:
        context = PipelineContext(text=text)
        for component in self.components:
            context = component.process(context)
        return context

# Global instance for reuse
ner_pipeline = NERPipeline()
