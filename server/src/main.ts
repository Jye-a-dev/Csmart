import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger/swagger.config';
import { spawn } from 'child_process';
import * as path from 'path';

function startPipelineAI() {
  const pipelineDir = path.resolve(process.cwd(), '../pipeline_ai/ai-engine');
  const isDev = process.env.NODE_ENV !== 'production';

  const pipeline = spawn(
    'python',
    [
      '-m',
      'uvicorn',
      'app.main:app',
      '--host',
      '0.0.0.0',
      '--port',
      '8000',
      ...(isDev ? ['--reload'] : []),
    ],
    {
      cwd: pipelineDir,
      stdio: 'pipe',
      shell: false,
    },
  );

  const prefix = '\x1b[35m[Pipeline]\x1b[0m'; // magenta prefix

  pipeline.stdout.on('data', (data: Buffer) => {
    data
      .toString()
      .split('\n')
      .filter(Boolean)
      .forEach((line) => console.log(`${prefix} ${line}`));
  });

  pipeline.stderr.on('data', (data: Buffer) => {
    data
      .toString()
      .split('\n')
      .filter(Boolean)
      .forEach((line) => console.error(`${prefix} ${line}`));
  });

  pipeline.on('error', (err) => {
    console.error(`${prefix} Failed to start: ${err.message}`);
  });

  pipeline.on('close', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${prefix} exited with code ${code}`);
    }
  });

  return pipeline;
}

async function pollPipelineReadiness(url: string, maxRetries = 20, delayMs = 500): Promise<boolean> {
  const prefix = '\x1b[35m[Pipeline Readiness]\x1b[0m';
  for (let i = 1; i <= maxRetries; i++) {
    try {
      const res = await fetch(`${url}/health`);
      if (res.ok) {
        console.log(`${prefix} AI Engine is healthy and ready (attempt ${i}).`);
        return true;
      }
    } catch {
      // Still booting up
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  console.warn(`${prefix} AI Engine health check timed out after ${maxRetries * delayMs}ms. Fallback mode enabled.`);
  return false;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase payload limit for base64 image uploads
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS for client applications
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

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

  // Start pipeline_ai alongside the server
  startPipelineAI();

  const pipelineUrl = process.env.AI_ENGINE_URL || 'http://localhost:8000';
  void pollPipelineReadiness(pipelineUrl);

  const serverPort = process.env.PORT ?? 3000;
  await app.listen(serverPort);

  console.log(`\n==================================================`);
  console.log(`[Server]   URL: http://localhost:${serverPort}`);
  console.log(
    `[Server]   Swagger Docs: http://localhost:${serverPort}/api/docs`,
  );
  console.log(`[Pipeline] URL: http://localhost:8000`);
  console.log(`==================================================\n`);
}
void bootstrap();
