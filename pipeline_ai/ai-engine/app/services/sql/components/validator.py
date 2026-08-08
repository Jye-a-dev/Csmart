from app.services.sql.base import SQLPipelineComponent
from app.services.sql.context import SQLPipelineContext

class ValidatorComponent(SQLPipelineComponent):
    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        if not context.generated_sql:
            context.generated_sql = "-- CANNOT_GENERATE_SQL"
            context.confidence_score = 0.0
            context.flag_for_review = True
            return context

        sql_upper = context.generated_sql.upper()
        unsafe_keywords = ["DELETE", "UPDATE", "INSERT", "DROP", "ALTER", "CREATE", "TRUNCATE", "RENAME"]
        is_unsafe = any(kw in sql_upper for kw in unsafe_keywords)
        
        if is_unsafe or "INVALID" in sql_upper:
            context.flag_for_review = True
            if is_unsafe:
                context.generated_sql = "-- INVALID_QUERY"
                context.confidence_score = 0.0
        else:
            context.flag_for_review = context.confidence_score < 0.70

        return context
