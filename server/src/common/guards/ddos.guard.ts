import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class DdosGuard extends ThrottlerGuard {
  protected shouldSkip(context: ExecutionContext): Promise<boolean> {
    // Không giới hạn tần suất yêu cầu ở môi trường phát triển (development)
    if (process.env.NODE_ENV !== 'production') {
      return Promise.resolve(true);
    }

    const request = context.switchToHttp().getRequest<Request>();
    const xForwardedFor = request.headers['x-forwarded-for'];
    const clientIp =
      request.ip ||
      (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor) ||
      request.socket.remoteAddress;

    // Bỏ qua giới hạn tần suất (DDoS protection bypass) cho các yêu cầu từ local loopback
    if (
      clientIp === '127.0.0.1' ||
      clientIp === '::1' ||
      clientIp === 'localhost' ||
      (typeof clientIp === 'string' && clientIp.includes('127.0.0.1'))
    ) {
      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }
}
