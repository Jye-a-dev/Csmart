import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Sse,
  Res,
  MessageEvent,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import type { Response } from 'express';
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
  @Sse()
  @ApiOperation({
    summary: 'Conversational shopping chat stream (GET via native EventSource)',
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
  @ApiOperation({
    summary: 'Conversational shopping chat stream with history (POST)',
  })
  chatPost(@Body() body: ChatStreamDto, @Res() res: Response) {
    if (!body || !body.messages || body.messages.length === 0) {
      throw new BadRequestException('Messages list cannot be empty');
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const subscription = this.copilotService
      .streamChat(body.messages)
      .subscribe({
        next: (event) => {
          res.write(`data: ${JSON.stringify(event.data)}\n\n`);
        },
        error: (err) => {
          res.write(`data: ${JSON.stringify({ error: String(err) })}\n\n`);
          res.end();
        },
        complete: () => {
          res.end();
        },
      });

    res.on('close', () => {
      subscription.unsubscribe();
    });
  }
}
