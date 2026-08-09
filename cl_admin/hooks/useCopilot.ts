import { useState, useCallback } from 'react';
import { ChatStreamDto } from '@/types/api';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useCopilot() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Start a GET chat stream (SSE via native EventSource).
   * Note: Native EventSource doesn't support custom headers (like Auth token) directly.
   */
  const chatGetStream = useCallback((
    message: string,
    onMessage: (data: string) => void,
    onError?: (err: unknown) => void,
    onClose?: () => void
  ) => {
    setLoading(true);
    setError(null);

    const url = `${BASE_URL}/copilot/chat?message=${encodeURIComponent(message)}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      onMessage(event.data);
    };

    eventSource.onerror = (err) => {
      setError(new Error('EventSource failed.'));
      if (onError) onError(err);
      eventSource.close();
      setLoading(false);
    };

    return {
      close: () => {
        eventSource.close();
        setLoading(false);
        if (onClose) onClose();
      },
    };
  }, []);

  /**
   * Start a POST chat stream with history.
   * Uses standard fetch API with a ReadableStream reader to support POSTing the chat history DTO.
   */
  const chatPostStream = useCallback(async (
    payload: ChatStreamDto,
    onMessage: (data: string) => void,
    onClose?: () => void
  ) => {
    setLoading(true);
    setError(null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      const response = await fetch(`${BASE_URL}/copilot/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // Process all complete lines except the last one (if it's not complete)
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data:')) {
            const dataContent = trimmed.slice(5).trim();
            onMessage(dataContent);
          }
        }
      }

      // Process any remaining text in the buffer
      if (buffer.trim().startsWith('data:')) {
        onMessage(buffer.trim().slice(5).trim());
      }
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
      if (onClose) onClose();
    }
  }, []);

  return {
    loading,
    error,
    chatGetStream,
    chatPostStream,
  };
}
