import { Module } from '@nestjs/common';
import { AiLogsService } from './ai-logs.service';
import { AiLogsController } from './ai-logs.controller';
import { AiLogsRepository } from './repositories/ai-logs.repository';

@Module({
  controllers: [AiLogsController],
  providers: [AiLogsService, AiLogsRepository],
  exports: [AiLogsService, AiLogsRepository],
})
export class AiLogsModule {}
