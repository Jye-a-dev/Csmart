import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiTasksService } from './ai-tasks.service';
import { AiTasksController } from './ai-tasks.controller';
import { OcrProcessor } from './processors/ocr.processor';
import { EvalProcessor } from './processors/eval.processor';
import { OcrRecordsModule } from '../ocr-records/ocr-records.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST') || 'localhost',
          port: parseInt(configService.get<string>('REDIS_PORT') || '6379', 10),
        },
      }),
    }),
    BullModule.registerQueue({ name: 'ocr-queue' }, { name: 'eval-queue' }),
    OcrRecordsModule, // Cung cấp OcrRecordsService cho OcrProcessor
  ],
  controllers: [AiTasksController],
  providers: [AiTasksService, OcrProcessor, EvalProcessor],
  exports: [AiTasksService],
})
export class AiTasksModule {}
