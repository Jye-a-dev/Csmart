import { Module } from '@nestjs/common';
import { AiProxyService } from './ai-proxy.service';
import { AiProxyController } from './ai-proxy.controller';
import { AiLogsModule } from '../ai-logs/ai-logs.module';
import { HitlModule } from '../hitl/hitl.module';
import { AiTasksModule } from '../ai-tasks/ai-tasks.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AiLogsModule, HitlModule, AiTasksModule, AuthModule],
  controllers: [AiProxyController],
  providers: [AiProxyService],
})
export class AiProxyModule {}
