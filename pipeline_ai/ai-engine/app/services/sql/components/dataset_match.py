from app.services.sql.base import SQLPipelineComponent
from app.services.sql.context import SQLPipelineContext
from app.services.text_to_sql import vitext2sql_service

class DatasetMatchComponent(SQLPipelineComponent):
    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        # Check if already processed by a previous component
        if context.generated_sql:
            return context

        query, score = vitext2sql_service.translate_with_score(context.question)
        # If similarity score is high enough, we can use it
        if score >= 0.15:
            context.generated_sql = query
            context.confidence_score = score
            
        return context
