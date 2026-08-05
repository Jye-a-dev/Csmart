import re
from app.services.ner.context import PipelineContext
from app.services.ner.base import PipelineComponent

class AddressExtractorComponent(PipelineComponent):
    def process(self, context: PipelineContext) -> PipelineContext:
        if context.intent == "UPDATE_ADDRESS":
            addr_match = re.search(r'(?:sang|đến|về)\s+(?:số\s+)?(.*)$', context.text, re.IGNORECASE)
            if addr_match:
                context.new_address = addr_match.group(1).strip()
        return context
