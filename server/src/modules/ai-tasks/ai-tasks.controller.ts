import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AiTasksService } from './ai-tasks.service';
import { AiClientService } from '../../common/services/ai-client.service';

interface ExpressMulterFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

@ApiTags('AiTasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai-tasks')
export class AiTasksController {
  constructor(
    private readonly aiTasksService: AiTasksService,
    private readonly aiClient: AiClientService,
  ) {}

  @Post('ocr')
  @Roles('CUSTOMER', 'SUPPORT', 'ADMIN')
  @ApiOperation({ summary: 'Submit OCR image processing background job' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ status: 202, description: 'Job accepted. Returns jobId' })
  async submitOcr(@UploadedFile() file: unknown) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const typedFile = file as ExpressMulterFile;
    const jobId = await this.aiTasksService.addOcrJob(
      typedFile.originalname,
      typedFile.buffer,
      typedFile.mimetype,
    );
    return { success: true, jobId, message: 'OCR task queued successfully' };
  }

  @Post('evaluate')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Submit self-evaluation background job' })
  @ApiResponse({ status: 202, description: 'Job accepted. Returns jobId' })
  async submitEvaluate() {
    const jobId = await this.aiTasksService.addEvalJob();
    return {
      success: true,
      jobId,
      message: 'Evaluation task queued successfully',
    };
  }

  @Get('status/:queue/:jobId')
  @Roles('CUSTOMER', 'SUPPORT', 'ADMIN')
  @ApiOperation({ summary: 'Get background job status' })
  async getStatus(
    @Param('queue') queue: 'ocr' | 'eval',
    @Param('jobId') jobId: string,
  ) {
    if (queue !== 'ocr' && queue !== 'eval') {
      throw new BadRequestException('Invalid queue name. Must be ocr or eval');
    }
    return this.aiTasksService.getJobStatus(queue, jobId);
  }

  @Get('circuit-breaker')
  @Roles('CUSTOMER', 'SUPPORT', 'ADMIN')
  @ApiOperation({ summary: 'Get AI Engine Circuit Breaker status' })
  getCircuitStatus() {
    return this.aiClient.getCircuitStateInfo();
  }
}
