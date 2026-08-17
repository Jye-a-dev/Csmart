import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import { BaseService } from '../../common/services/base.service';
import { PG_CONNECTION } from '../../database/pg.provider';
import { AiClientService } from '../../common/services/ai-client.service';
import { AiLogsService } from '../ai-logs/ai-logs.service';
import { HitlService } from '../hitl/hitl.service';
import { SqlGuardrailStrategy } from './strategies/sql-guardrail.strategy';
import {
  IntentRequestDto,
  NerRequestDto,
  SearchRequestDto,
  SqlRequestDto,
} from './dto/ai-proxy.dto';

/** Ngưỡng confidence tối thiểu — dưới ngưỡng này sẽ bị đưa vào review queue */
const CONFIDENCE_THRESHOLD = 0.75;

@Injectable()
export class AiProxyService extends BaseService {
  constructor(
    private readonly aiClient: AiClientService,
    private readonly aiLogsService: AiLogsService,
    private readonly hitlService: HitlService,
    private readonly sqlGuardrail: SqlGuardrailStrategy,
    @Inject(PG_CONNECTION) private readonly pool: Pool,
  ) {
    super(AiProxyService.name);
  }

  /**
   * Gọi FastAPI và ghi log trước/sau. Nếu flag_for_review=true hoặc confidence thấp → đẩy vào HITL queue.
   */
  private async proxyAndLog<TResult extends Record<string, any>>(
    endpoint: string,
    fetchFn: () => Promise<TResult>,
    inputText: string,
    userId?: string,
    fallback?: TResult,
  ): Promise<TResult> {
    const startTime = Date.now();

    // Check if there is an existing corrected log (learned fix) for this endpoint and input
    if (inputText && inputText.trim()) {
      const correctedLog = await this.aiLogsService.findCorrectedLog(
        endpoint,
        inputText,
      );
      if (correctedLog && correctedLog.corrected_output) {
        const learnedResult = correctedLog.corrected_output as TResult;

        // Log the execution using the learned correction
        await this.aiLogsService.create({
          endpoint,
          user_id: userId,
          input_text: inputText,
          output_json: learnedResult,
          confidence_score: 1.0,
          flag_for_review: false,
          execution_time_ms: Date.now() - startTime,
        });

        this.logInfo(
          `[AI Learned Cache] Return corrected output for ${endpoint}: "${inputText}"`,
        );
        return learnedResult;
      }
    }

    // Pre-log: ghi trước khi gọi pipeline (output_json tạm rỗng)
    const preLog = await this.aiLogsService.create({
      endpoint,
      user_id: userId,
      input_text: inputText,
      output_json: { status: 'processing' },
      flag_for_review: false,
    });

    let result: TResult;
    try {
      result = await fetchFn();
    } catch (err) {
      this.logError(`Pipeline error on ${endpoint}: ${String(err)}`);
      result = fallback as TResult;
    }

    const executionTimeMs = Date.now() - startTime;
    const confidenceScore =
      (result['confidence_score'] as number | undefined) ?? 1.0;
    const flagForReview =
      (result['flag_for_review'] as boolean | undefined) ?? false;
    const shouldReview =
      flagForReview || confidenceScore < CONFIDENCE_THRESHOLD;

    // Post-log: cập nhật kết quả thực tế
    await this.aiLogsService.update(preLog.id, {
      output_json: result,
      confidence_score: confidenceScore,
      flag_for_review: shouldReview,
      execution_time_ms: executionTimeMs,
    });

    // Nếu cần review → đưa vào HITL queue và liên kết log
    if (shouldReview) {
      const reviewEntry = await this.hitlService.enqueue({
        log_id: preLog.id,
        endpoint,
        user_id: userId,
        input_text: inputText,
        output_json: result,
        confidence_score: confidenceScore,
      });
      // Cập nhật review_id vào log
      await this.aiLogsService.updateReviewId(preLog.id, reviewEntry.id);

      this.logWarn(
        `[HITL] ${endpoint} enqueued for review (confidence=${confidenceScore}, flag=${flagForReview})`,
      );
    }

    return result;
  }

  // ─── Intent Classification ───────────────────────────────────────────────

  async classifyIntent(dto: IntentRequestDto, userId?: string) {
    const fallback = {
      success: false,
      status: 'error',
      query: dto.query,
      intent: 'UNKNOWN',
      entities: {},
      confidence_score: 0,
      flag_for_review: true,
    };

    return this.proxyAndLog(
      'classify-intent',
      () =>
        this.aiClient.request<typeof fallback>(
          '/api/v1/classify-intent',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: dto.query }),
          },
          fallback,
        ),
      dto.query,
      userId,
      fallback,
    );
  }

  // ─── NER / Slot Filling ───────────────────────────────────────────────────

  async extractNer(dto: NerRequestDto, userId?: string) {
    const fallback = {
      status: 'error',
      intent: 'GENERAL_CHAT',
      slots: { order_id: null, order_ids: null, new_address: null },
      confidence_score: 0,
      flag_for_review: true,
    };

    return this.proxyAndLog(
      'extract-ner',
      () =>
        this.aiClient.request<typeof fallback>(
          '/api/v1/extract-ner',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: dto.text }),
          },
          fallback,
        ),
      dto.text,
      userId,
      fallback,
    );
  }

  // ─── Hybrid Search ────────────────────────────────────────────────────────

  async hybridSearch(dto: SearchRequestDto, userId?: string) {
    const fallback = {
      success: false,
      status: 'error',
      results: [],
      execution_time_ms: 0,
    };

    return this.proxyAndLog(
      'search-hybrid',
      () =>
        this.aiClient.request<typeof fallback>(
          '/api/v1/search/hybrid',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: dto.query, limit: dto.limit ?? 10 }),
          },
          fallback,
        ),
      dto.query,
      userId,
      fallback,
    );
  }

  // ─── Text-to-SQL ──────────────────────────────────────────────────────────

  async textToSql(dto: SqlRequestDto, userId?: string) {
    const fallback = {
      status: 'error',
      question: dto.question,
      generated_sql: '-- INVALID_QUERY',
      confidence_score: 0,
      flag_for_review: true,
      result: [] as unknown[],
      error: 'FastAPI AI Engine connection failed',
    };

    const res = await this.proxyAndLog(
      'text-to-sql',
      () =>
        this.aiClient.request<typeof fallback>(
          '/api/v1/text-to-sql',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: dto.question }),
          },
          fallback,
        ),
      dto.question,
      userId,
      fallback,
    );

    // Execute the generated SQL query against PostgreSQL database if present
    const sql = res.generated_sql?.trim();
    if (sql) {
      // Validate SQL with strategy guardrail
      const validation = this.sqlGuardrail.validateReadOnlySql(sql);
      if (!validation.isValid) {
        return {
          ...res,
          result: [],
          error: validation.error,
        };
      }

      const startTime = Date.now();
      try {
        const queryRes = await this.pool.query(sql);
        const rows = this.sqlGuardrail.sanitizeRows(
          queryRes.rows as Record<string, unknown>[],
        );
        const yesNoAnswer = this.sqlGuardrail.evaluateYesNoAnswer(
          dto.question,
          rows,
        );

        return {
          ...res,
          result: rows,
          yes_no_answer: yesNoAnswer,
          message:
            yesNoAnswer !== undefined
              ? yesNoAnswer
                ? 'Có'
                : 'Không có'
              : rows.length === 0
                ? 'Không có dữ liệu'
                : undefined,
          execution_time_ms: Date.now() - startTime,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
          ...res,
          result: [],
          error: `SQL Execution Error: ${msg}`,
          execution_time_ms: Date.now() - startTime,
        };
      }
    }

    return res;
  }
}
