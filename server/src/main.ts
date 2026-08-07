import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Setup Swagger API docs
  setupSwagger(app);

  const serverPort = process.env.PORT ?? 3000;
  await app.listen(serverPort);

  console.log(`\n==================================================`);
  console.log(`[Server]   URL: http://localhost:${serverPort}`);
  console.log(
    `[Server]   Swagger Docs: http://localhost:${serverPort}/api/docs`,
  );
  console.log(`==================================================\n`);
}
void bootstrap();
