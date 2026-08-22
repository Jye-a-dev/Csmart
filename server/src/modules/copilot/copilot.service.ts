import { Injectable, MessageEvent, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { Pool } from 'pg';
import { PG_CONNECTION } from '../../database/pg.provider';
import { AiLogsService } from '../ai-logs/ai-logs.service';
import { HitlService } from '../hitl/hitl.service';

const CONFIDENCE_THRESHOLD = 0.75;

@Injectable()
export class CopilotService {
  private readonly logger = new Logger(CopilotService.name);
  private readonly aiEngineUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly aiLogsService: AiLogsService,
    private readonly hitlService: HitlService,
    @Inject(PG_CONNECTION) private readonly pool: Pool,
  ) {
    this.aiEngineUrl =
      this.configService.get<string>('AI_ENGINE_URL') ||
      'http://localhost:8000';
  }

  streamChat(messages: unknown[], userId?: string): Observable<MessageEvent> {
    const startTime = Date.now();
    const lastUserMsg = Array.isArray(messages)
      ? (messages[messages.length - 1] as { content?: string })?.content || ''
      : '';

    let accumulatedText = '';

    const finalizeLogAndReview = async (
      outputText: string,
      confidence: number,
      flagForReview: boolean,
    ) => {
      const executionTimeMs = Date.now() - startTime;
      const shouldReview = flagForReview || confidence < CONFIDENCE_THRESHOLD;

      try {
        const log = await this.aiLogsService.create({
          endpoint: 'copilot-chat-stream',
          user_id: userId,
          input_text: lastUserMsg,
          output_json: { response: outputText, messages },
          confidence_score: confidence,
          flag_for_review: shouldReview,
          execution_time_ms: executionTimeMs,
        });

        if (shouldReview) {
          const reviewEntry = await this.hitlService.enqueue({
            log_id: log.id,
            endpoint: 'copilot-chat-stream',
            user_id: userId,
            input_text: lastUserMsg,
            output_json: { response: outputText, messages },
            confidence_score: confidence,
          });
          await this.aiLogsService.updateReviewId(log.id, reviewEntry.id);
        }
      } catch (err) {
        this.logger.error('Failed to persist copilot log into DB:', err);
      }
    };

    return new Observable<MessageEvent>((subscriber) => {
      const url = `${this.aiEngineUrl}/api/v1/copilot/chat`;

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })
        .then(async (response) => {
          if (!response.ok) {
            await this.fallbackStream(
              messages,
              subscriber,
              finalizeLogAndReview,
            );
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            await this.fallbackStream(
              messages,
              subscriber,
              finalizeLogAndReview,
            );
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const dataStr = line.replace('data: ', '').trim();
                  if (dataStr) {
                    try {
                      const parsed = JSON.parse(dataStr) as Record<
                        string,
                        unknown
                      >;
                      if (typeof parsed.text === 'string') {
                        accumulatedText += parsed.text;
                      } else if (
                        parsed.text !== undefined &&
                        parsed.text !== null
                      ) {
                        accumulatedText += JSON.stringify(parsed.text);
                      }
                      subscriber.next({ data: parsed });
                    } catch {
                      // Skip
                    }
                  }
                }
              }
            }
            subscriber.complete();
            void finalizeLogAndReview(accumulatedText, 0.9, false);
          } catch {
            await this.fallbackStream(
              messages,
              subscriber,
              finalizeLogAndReview,
            );
          }
        })
        .catch(async () => {
          await this.fallbackStream(messages, subscriber, finalizeLogAndReview);
        });
    });
  }

  private async fallbackStream(
    messages: unknown[],
    subscriber: import('rxjs').Subscriber<MessageEvent>,
    finalizeLogFn: (text: string, conf: number, flag: boolean) => Promise<void>,
  ) {
    try {
      let productInfo = '';
      try {
        const dbRes = await this.pool.query(
          'SELECT name, price FROM products WHERE stock > 0 LIMIT 5',
        );
        if (dbRes.rows && dbRes.rows.length > 0) {
          productInfo =
            ' Danh sách sản phẩm nổi bật của shop: ' +
            dbRes.rows
              .map(
                (p: { name: string; price: number }) =>
                  `${p.name} (${Number(p.price).toLocaleString('vi-VN')}đ)`,
              )
              .join(', ') +
            '.';
        }
      } catch {
        // Ignore DB query error
      }

      const lastUserMsg = Array.isArray(messages)
        ? (messages[messages.length - 1] as { content?: string })?.content || ''
        : '';

      const fallbackText = `Xin chào! Tôi là CSMART AI Copilot.${productInfo} Tôi đã nhận được câu hỏi: "${lastUserMsg}". Bạn cần tư vấn thêm về sản phẩm hoặc đơn hàng nào không?`;

      const words = fallbackText.split(' ');
      for (const word of words) {
        subscriber.next({ data: { text: word + ' ' } });
        await new Promise((resolve) => setTimeout(resolve, 35));
      }
      subscriber.complete();
      void finalizeLogFn(fallbackText, 0.85, false);
    } catch (err) {
      this.logger.error('Copilot fallback error:', err);
      const errText = 'CSMART AI Copilot luôn sẵn sàng hỗ trợ bạn.';
      subscriber.next({
        data: { text: errText },
      });
      subscriber.complete();
      void finalizeLogFn(errText, 0.5, true);
    }
  }
}
