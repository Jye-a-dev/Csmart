import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  ValidationPipe,
} from '@nestjs/common';
import { AppService } from './app.service';

const bypassValidation = new ValidationPipe({
  whitelist: false,
  forbidNonWhitelisted: false,
  transform: false,
});

@Controller('landing')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('config')
  getLandingConfig(): Record<string, unknown> {
    return this.appService.getLandingConfig();
  }

  @Post('config')
  createOrUpdateLandingConfig(
    @Body(bypassValidation) body: Record<string, unknown>,
  ): Record<string, unknown> {
    return this.appService.updateLandingConfig(body);
  }

  @Put('config')
  updateLandingConfig(
    @Body(bypassValidation) body: Record<string, unknown>,
  ): Record<string, unknown> {
    return this.appService.updateLandingConfig(body);
  }

  @Post('config/reset')
  resetLandingConfig(): Record<string, unknown> {
    return this.appService.resetLandingConfig();
  }
}
