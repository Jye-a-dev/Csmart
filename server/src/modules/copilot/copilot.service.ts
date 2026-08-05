import { Injectable, MessageEvent } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class CopilotService {
  private readonly aiEngineUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.aiEngineUrl =
      this.configService.get<string>('AI_ENGINE_URL') ||
      'http://localhost:8000';
  }

  streamChat(messages: unknown[]): Observable<MessageEvent> {
    return new Observable<MessageEvent>((subscriber) => {
      const url = `${this.aiEngineUrl}/api/v1/copilot/chat`;

      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      })
        .then(async (response) => {
          if (!response.ok) {
            subscriber.error(
              new Error(`AI Engine HTTP error! Status: ${response.status}`),
            );
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            subscriber.error(new Error('AI Engine response is not readable'));
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
                      // Send Event message down to NestJS client
                      subscriber.next({ data: parsed });
                    } catch {
                      // Skip parsing errors
                    }
                  }
                }
              }
            }
            subscriber.complete();
          } catch (err) {
            subscriber.error(err);
          }
        })
        .catch((err) => subscriber.error(err));
    });
  }
}
