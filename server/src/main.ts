import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupSwagger } from './swagger/swagger.config';
import { spawn } from 'child_process';
import * as path from 'path';
import * as net from 'net';
import * as readline from 'readline';

function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(500);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, '127.0.0.1', () => {
      socket.end();
      resolve(true);
    });
  });
}

async function startPipeline(port: number) {
  const isOpen = await isPortOpen(port);
  if (isOpen) {
    console.log(`[Pipeline] AI Engine is already running on port ${port}.`);
    return;
  }

  const pipelineDir = path.resolve(process.cwd(), '../pipeline_ai');
  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? 'run.bat' : './run.sh';
  const args = ['start'];

  console.log(`[Pipeline] Starting AI Engine on port ${port}...`);
  const child = spawn(cmd, args, {
    cwd: pipelineDir,
    shell: true,
    stdio: 'pipe',
    env: { ...process.env, PORT: port.toString() },
  });

  const rlStdout = readline.createInterface({
    input: child.stdout,
    terminal: false,
  });
  rlStdout.on('line', (line) => {
    console.log(`[Pipeline] ${line}`);
  });

  const rlStderr = readline.createInterface({
    input: child.stderr,
    terminal: false,
  });
  rlStderr.on('line', (line) => {
    console.error(`[Pipeline] [Error] ${line}`);
  });

  const cleanup = () => {
    console.log('[Pipeline] Stopping AI Engine...');
    child.kill();
  };

  process.on('exit', cleanup);
  process.on('SIGINT', () => {
    cleanup();
    process.exit();
  });
  process.on('SIGTERM', () => {
    cleanup();
    process.exit();
  });
}

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

  // Parse AI Engine URL to get the target port
  const aiEngineUrl = process.env.AI_ENGINE_URL || 'http://localhost:8000';
  let aiPort = 8000;
  try {
    const url = new URL(aiEngineUrl);
    aiPort = url.port ? parseInt(url.port, 10) : 8000;
  } catch (error) {
    aiPort = 8000;
  }

  // Start pipeline concurrently
  void startPipeline(aiPort);

  const serverPort = process.env.PORT ?? 3000;
  await app.listen(serverPort);

  console.log(`\n==================================================`);
  console.log(`[Server]   URL: http://localhost:${serverPort}`);
  console.log(
    `[Server]   Swagger Docs: http://localhost:${serverPort}/api/docs`,
  );
  console.log(`[Pipeline] URL: http://localhost:${aiPort}`);
  console.log(`[Pipeline] Swagger Docs: http://localhost:${aiPort}/docs`);
  console.log(`==================================================\n`);
}
void bootstrap();
