import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
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

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  const serverPort = process.env.PORT ?? 3000;
  await app.listen(serverPort);

  // Start pipeline_ai alongside the server
  startPipelineAI();

  console.log(`\n==================================================`);
  console.log(`[Server]   URL: http://localhost:${serverPort}`);
  console.log(
    `[Server]   Swagger Docs: http://localhost:${serverPort}/api/docs`,
  );
  console.log(`[Pipeline] URL: http://localhost:8000`);
  console.log(`==================================================\n`);
}
void bootstrap();
