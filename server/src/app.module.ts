import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { DdosGuard } from './common/guards/ddos.guard';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { FaqsModule } from './modules/faqs/faqs.module';
import { AiLogsModule } from './modules/ai-logs/ai-logs.module';
import { CommonServicesModule } from './common/services/common-services.module';
import { AiTasksModule } from './modules/ai-tasks/ai-tasks.module';
import { CopilotModule } from './modules/copilot/copilot.module';
import { AiProxyModule } from './modules/ai-proxy/ai-proxy.module';
import { HitlModule } from './modules/hitl/hitl.module';
import { OcrRecordsModule } from './modules/ocr-records/ocr-records.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: Number(config.get<number>('THROTTLE_TTL', 60000)),
          limit: Number(config.get<number>('THROTTLE_LIMIT', 10)),
        },
      ],
    }),
    DatabaseModule,
    CommonServicesModule,
    AiTasksModule,
    CopilotModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProductsModule,
    OrdersModule,
    PaymentsModule,
    FaqsModule,
    AiLogsModule,
    AiProxyModule,
    HitlModule,
    OcrRecordsModule,
  ],

  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: DdosGuard,
    },
  ],
})
export class AppModule {}
