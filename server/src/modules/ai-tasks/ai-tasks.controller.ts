import {
  Controller,
  Post,
  Get,
  Param,
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
} from '@nestjs/swagger';
import { AiTasksService } from './ai-tasks.service';
import { AiClientService } from '../../common/services/ai-client.service';

interface ExpressMulterFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

@ApiTags('AiTasks')
@Controller('ai-tasks')
export class AiTasksController {
  constructor(
    private readonly aiTasksService: AiTasksService,
    private readonly aiClient: AiClientService,
  ) {}

  @Post('ocr')
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
  @ApiOperation({ summary: 'Get AI Engine Circuit Breaker status' })
  getCircuitStatus() {
    return this.aiClient.getCircuitStateInfo();
  }
}
