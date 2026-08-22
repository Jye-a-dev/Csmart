import re
from app.services.sql.base import SQLPipelineComponent
from app.services.sql.context import SQLPipelineContext

class ValidatorComponent(SQLPipelineComponent):
    def process(self, context: SQLPipelineContext) -> SQLPipelineContext:
        if not context.generated_sql:
            context.generated_sql = "-- CANNOT_GENERATE_SQL"
            context.confidence_score = 0.0
            context.flag_for_review = True
            return context

        sql = context.generated_sql.strip()
        sql_clean = re.sub(r';+$', '', sql).strip()

        has_stacked_query = ';' in sql_clean
        has_comment_injection = '--' in sql_clean or '/*' in sql_clean or '*/' in sql_clean

        unsafe_pattern = re.compile(
            r'\b(DELETE|UPDATE|INSERT|DROP|ALTER|CREATE|TRUNCATE|RENAME|GRANT|REVOKE|EXEC|EXECUTE|COPY|PG_SLEEP)\b',
            re.IGNORECASE
        )
        has_unsafe_keywords = bool(unsafe_pattern.search(sql_clean))

        sql_upper = sql_clean.upper()
        is_read_only = sql_upper.startswith("SELECT") or sql_upper.startswith("WITH")

        if has_stacked_query or has_comment_injection or has_unsafe_keywords or not is_read_only or "INVALID" in sql_upper:
            context.flag_for_review = True
            context.generated_sql = "-- INVALID_QUERY"
            context.confidence_score = 0.0
        else:
            context.flag_for_review = context.confidence_score < 0.70

        return context

