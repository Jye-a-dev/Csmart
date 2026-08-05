import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Sse,
  MessageEvent,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { CopilotService } from './copilot.service';

class ChatMessageDto {
  role: 'user' | 'assistant';
  content: string;
}

class ChatStreamDto {
  messages: ChatMessageDto[];
}

@ApiTags('Copilot')
@Controller('copilot')
export class CopilotController {
  constructor(private readonly copilotService: CopilotService) {}

  @Get('chat')
  @Sse('chat-stream-get')
  @ApiOperation({
    summary:
      'Conversational shopping chat stream (GET via native EventSource)',
  })
  @ApiQuery({
    name: 'message',
    required: true,
    description: 'User message to send to Copilot',
  })
  chatGet(@Query('message') message: string): Observable<MessageEvent> {
    if (!message) {
      throw new BadRequestException('Message query parameter is required');
    }
    const history = [{ role: 'user', content: message } as const];
    return this.copilotService.streamChat(history);
  }

  @Post('chat/stream')
  @Sse('chat-stream-post')
  @ApiOperation({
    summary: 'Conversational shopping chat stream with history (POST)',
  })
  chatPost(@Body() body: ChatStreamDto): Observable<MessageEvent> {
    if (!body || !body.messages || body.messages.length === 0) {
      throw new BadRequestException('Messages list cannot be empty');
    }
    return this.copilotService.streamChat(body.messages);
  }
}
