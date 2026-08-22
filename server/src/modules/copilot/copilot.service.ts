import { Injectable, MessageEvent, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { Pool, QueryResult } from 'pg';
import { PG_CONNECTION } from '../../database/pg.provider';
import { AiLogsService } from '../ai-logs/ai-logs.service';
import { HitlService } from '../hitl/hitl.service';

const CONFIDENCE_THRESHOLD = 0.75;

interface ProductCountRow {
  total: number;
  available: number;
}

interface CategorySummaryRow {
  category_name: string;
  product_count: number;
}

interface ProductSummaryRow {
  name: string;
  price: number;
  stock_quantity: number;
  category_name: string | null;
}

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

  streamChat(
    messages: unknown[],
    userId?: string,
    options?: {
      temperature?: number;
      confidence_threshold?: number;
      system_prompt?: string;
    },
  ): Observable<MessageEvent> {
    const startTime = Date.now();
    const threshold = options?.confidence_threshold ?? CONFIDENCE_THRESHOLD;
    const historyList = Array.isArray(messages)
      ? (messages as Array<{ role?: string; content?: string }>)
      : [];
    const lastUserMsg = (
      historyList[historyList.length - 1]?.content || ''
    ).trim();

    let accumulatedText = '';

    const finalizeLogAndReview = async (
      outputText: string,
      confidence: number,
      flagForReview: boolean,
    ) => {
      const executionTimeMs = Date.now() - startTime;
      const shouldReview = flagForReview || confidence < threshold;

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
      void (async () => {
        const dbContext = await this.buildDatabaseContext(lastUserMsg);

        const coreSystemPrompt = `Bạn là CSMART AI Copilot - Trợ lý bán hàng và hỗ trợ khách hàng thông minh cho hệ thống thương mại điện tử CSMART.
QUY TẮC BẮT BUỘC:
1. TRẢ LỜI TRỰC TIẾP: Đi thẳng vào trọng tâm câu hỏi. Tuyệt đối KHÔNG lặp lại câu hỏi của người dùng.
2. KHÔNG LẶP LỜI CHÀO: Không chào lại ở mỗi lượt nếu cuộc hội thoại đang tiếp diễn.
3. SỬ DỤNG DỮ LIỆU THỰC TẾ: Khi người dùng hỏi về số lượng sản phẩm, danh mục, giá cả hoặc tình trạng kho, BẮT BUỘC dùng chính xác số liệu từ dữ liệu database được cấp dưới đây để trả lời cụ thể.
4. NGỮ CẢNH HỘI THOẠI: Nếu câu hỏi ngắn hoặc thiếu ngữ cảnh (ví dụ: "có", "giá sao", "màu gì"), hãy đối chiếu với lịch sử hội thoại gần nhất.
5. NGÔN NGỮ: BẮT BUỘC trả lời 100% bằng Tiếng Việt tự nhiên, thân thiện và chính xác.

${dbContext}
${options?.system_prompt ? `\nYêu cầu bổ sung: ${options.system_prompt}` : ''}`;

        const url = `${this.aiEngineUrl}/api/v1/copilot/chat`;

        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages,
              temperature: options?.temperature,
              confidence_threshold: options?.confidence_threshold,
              system_prompt: coreSystemPrompt,
            }),
          });

          if (!response.ok) {
            await this.fallbackStream(
              messages,
              subscriber,
              finalizeLogAndReview,
              dbContext,
            );
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            await this.fallbackStream(
              messages,
              subscriber,
              finalizeLogAndReview,
              dbContext,
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
                const trimmed = line.trim();
                if (trimmed.startsWith('data:')) {
                  const dataStr = trimmed.slice(5).trim();
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
                      // Skip malformed chunk
                    }
                  }
                }
              }
            }

            if (buffer.trim().startsWith('data:')) {
              const dataStr = buffer.trim().slice(5).trim();
              if (dataStr) {
                try {
                  const parsed = JSON.parse(dataStr) as Record<string, unknown>;
                  if (typeof parsed.text === 'string') {
                    accumulatedText += parsed.text;
                  }
                  subscriber.next({ data: parsed });
                } catch {
                  // Skip
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
              dbContext,
            );
          }
        } catch {
          await this.fallbackStream(
            messages,
            subscriber,
            finalizeLogAndReview,
            dbContext,
          );
        }
      })();
    });
  }

  private async buildDatabaseContext(query: string): Promise<string> {
    try {
      const countRes: QueryResult<ProductCountRow> =
        await this.pool.query<ProductCountRow>(
          `SELECT 
          COUNT(*)::int as total, 
          COUNT(*) FILTER (WHERE stock_quantity > 0)::int as available 
        FROM products WHERE is_published = true;`,
        );
      const totalProducts = countRes.rows[0]?.total ?? 0;
      const availableProducts = countRes.rows[0]?.available ?? 0;

      const catRes: QueryResult<CategorySummaryRow> =
        await this.pool.query<CategorySummaryRow>(
          `SELECT c.name as category_name, COUNT(p.id)::int as product_count
        FROM categories c
        LEFT JOIN products p ON p.category_id = c.id AND p.is_published = true
        GROUP BY c.id, c.name
        ORDER BY product_count DESC
        LIMIT 10;`,
        );
      const categoriesSummary = catRes.rows
        .map(
          (r: CategorySummaryRow) =>
            `+ ${r.category_name}: ${r.product_count} sản phẩm`,
        )
        .join('\n');

      let productsRes: QueryResult<ProductSummaryRow> | null = null;
      if (query && query.trim().length > 1) {
        productsRes = await this.pool.query<ProductSummaryRow>(
          `SELECT p.name, COALESCE(p.discount_price, p.base_price)::numeric as price, p.stock_quantity, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.is_published = true AND (p.name ILIKE $1 OR c.name ILIKE $1 OR p.description ILIKE $1)
          ORDER BY p.created_at DESC
          LIMIT 6;`,
          [`%${query.trim()}%`],
        );
      }

      if (!productsRes || productsRes.rows.length === 0) {
        productsRes = await this.pool.query<ProductSummaryRow>(
          `SELECT p.name, COALESCE(p.discount_price, p.base_price)::numeric as price, p.stock_quantity, c.name as category_name
          FROM products p
          LEFT JOIN categories c ON p.category_id = c.id
          WHERE p.is_published = true AND p.stock_quantity > 0
          ORDER BY p.created_at DESC
          LIMIT 6;`,
        );
      }

      const productsList = productsRes.rows
        .map(
          (p: ProductSummaryRow, idx: number) =>
            `${idx + 1}. ${p.name} (Giá: ${Number(p.price).toLocaleString('vi-VN')}đ, Kho: ${p.stock_quantity}, Danh mục: ${p.category_name || 'Khác'})`,
        )
        .join('\n');

      return `=== DỮ LIỆU THỰC TẾ TỪ CƠ SỞ DỮ LIỆU CSMART ===
- Tổng số sản phẩm hiện có: ${totalProducts} sản phẩm (${availableProducts} sản phẩm sẵn sàng giao).
- Danh mục sản phẩm:
${categoriesSummary || '+ Chưa có danh mục'}
- Danh sách sản phẩm tiêu biểu:
${productsList || 'Không có sản phẩm nào'}
================================================`;
    } catch (err) {
      this.logger.warn('Failed to retrieve DB context for Copilot:', err);
      return '';
    }
  }

  private async fallbackStream(
    messages: unknown[],
    subscriber: import('rxjs').Subscriber<MessageEvent>,
    finalizeLogFn: (text: string, conf: number, flag: boolean) => Promise<void>,
    dbContext: string,
  ) {
    try {
      const historyList = Array.isArray(messages)
        ? (messages as Array<{ role?: string; content?: string }>)
        : [];
      const lastUserMsg = (
        historyList[historyList.length - 1]?.content || ''
      )
        .trim()
        .toLowerCase();
      const isFirstTurn =
        historyList.filter((m) => m.role === 'user').length <= 1;

      let reply = '';
      if (
        lastUserMsg.includes('sản phẩm') ||
        lastUserMsg.includes('bao nhiêu') ||
        lastUserMsg.includes('hàng') ||
        lastUserMsg.includes('quần') ||
        lastUserMsg.includes('áo') ||
        lastUserMsg.includes('giá') ||
        lastUserMsg.includes('danh mục')
      ) {
        reply = `Dựa trên dữ liệu thực tế tại hệ thống CSMART:${dbContext ? `\n\n${dbContext}` : '\nHiện tại cửa hàng đang cập nhật thêm các mẫu sản phẩm mới.'}\n\nBạn muốn tìm kiếm cụ thể mẫu sản phẩm nào hoặc cần tư vấn thêm về kích thước/giá cả không?`;
      } else if (
        lastUserMsg.includes('chào') ||
        lastUserMsg.includes('hi') ||
        lastUserMsg.includes('hello') ||
        lastUserMsg === 'alo'
      ) {
        reply = isFirstTurn
          ? 'Chào bạn! Tôi là CSMART AI Copilot. Tôi có thể hỗ trợ bạn tìm kiếm sản phẩm, kiểm tra giá, tồn kho hoặc quản lý đơn hàng ngay bây giờ.'
          : 'Tôi có thể hỗ trợ bạn xem danh mục sản phẩm, kiểm tra tình trạng kho hoặc tra cứu đơn hàng. Bạn cần tìm gì ạ?';
      } else if (
        lastUserMsg.includes('đơn hàng') ||
        lastUserMsg.includes('vận chuyển') ||
        lastUserMsg.includes('order')
      ) {
        reply =
          'Để tra cứu trạng thái giao hàng hoặc chi tiết đơn hàng, bạn vui lòng cung cấp mã đơn hàng (Order ID) để tôi kiểm tra ngay trên hệ thống nhé.';
      } else {
        reply = `Tôi có thể hỗ trợ bạn tra cứu danh mục sản phẩm, kiểm tra tình trạng còn hàng và báo giá chi tiết trong hệ thống CSMART. Bạn hãy cho tôi biết nhu cầu mua sắm cụ thể nhé.`;
      }

      const words = reply.split(' ');
      for (const word of words) {
        subscriber.next({ data: { text: word + ' ' } });
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      subscriber.complete();
      void finalizeLogFn(reply, 0.9, false);
    } catch (err) {
      this.logger.error('Copilot fallback error:', err);
      const errText =
        'Tôi luôn sẵn sàng hỗ trợ bạn tra cứu sản phẩm và đơn hàng tại CSMART.';
      subscriber.next({ data: { text: errText } });
      subscriber.complete();
      void finalizeLogFn(errText, 0.5, true);
    }
  }
}
