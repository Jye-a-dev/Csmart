import { Module } from '@nestjs/common';
import { CopilotService } from './copilot.service';
import { CopilotController } from './copilot.controller';
import { DatabaseModule } from '../../database/database.module';
import { AiLogsModule } from '../ai-logs/ai-logs.module';
import { HitlModule } from '../hitl/hitl.module';

@Module({
  imports: [DatabaseModule, AiLogsModule, HitlModule],
  controllers: [CopilotController],
  providers: [CopilotService],
  exports: [CopilotService],
})
export class CopilotModule {}
