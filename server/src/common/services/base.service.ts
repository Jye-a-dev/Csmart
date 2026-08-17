import { Logger } from '@nestjs/common';

/**
 * Abstract Base Service cung cấp nền tảng Logging & Utility chung cho các NestJS Services.
 */
export abstract class BaseService {
  protected readonly logger: Logger;

  constructor(serviceName: string) {
    this.logger = new Logger(serviceName);
  }

  protected logInfo(message: string): void {
    this.logger.log(message);
  }

  protected logWarn(message: string): void {
    this.logger.warn(message);
  }

  protected logError(message: string, trace?: string): void {
    this.logger.error(message, trace);
  }
}
