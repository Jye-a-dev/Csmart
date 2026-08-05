import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
