export interface ChatMessageDto {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatStreamDto {
  messages: ChatMessageDto[];
}
