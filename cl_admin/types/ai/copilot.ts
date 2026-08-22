export interface ChatMessageDto {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatStreamDto {
  messages: ChatMessageDto[];
  temperature?: number;
  confidence_threshold?: number;
  system_prompt?: string;
}

