import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AiProxyService } from './ai-proxy.service';
import { AiTasksService } from '../ai-tasks/ai-tasks.service';
import {
  IntentRequestDto,
  NerRequestDto,
  SearchRequestDto,
  SqlRequestDto,
} from './dto/ai-proxy.dto';

interface AuthRequest extends Request {
  user?: { sub: number; email: string; role: string };
}

interface MulterFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}

@ApiTags('AI Proxy')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiProxyController {
  constructor(
    private readonly aiProxyService: AiProxyService,
    private readonly aiTasksService: AiTasksService,
  ) {}

  // ─── Intent Classification — USER, SUPPORT, ADMIN ────────────────────────

  @Post('intent')
  @Roles('CUSTOMER', 'SUPPORT', 'ADMIN')
  @ApiOperation({ summary: 'Phân loại ý định mua sắm (proxied → pipeline)' })
  classifyIntent(@Body() dto: IntentRequestDto, @Request() req: AuthRequest) {
    return this.aiProxyService.classifyIntent(dto, req.user?.sub);
  }

  // ─── NER / Slot Filling — USER, SUPPORT, ADMIN ───────────────────────────

  @Post('ner')
  @Roles('CUSTOMER', 'SUPPORT', 'ADMIN')
  @ApiOperation({ summary: 'Trích xuất thực thể NER (proxied → pipeline)' })
  extractNer(@Body() dto: NerRequestDto, @Request() req: AuthRequest) {
    return this.aiProxyService.extractNer(dto, req.user?.sub);
  }

  // ─── Hybrid Search — USER, SUPPORT, ADMIN ────────────────────────────────

  @Post('search')
  @Roles('CUSTOMER', 'SUPPORT', 'ADMIN')
  @ApiOperation({ summary: 'Tìm kiếm sản phẩm Hybrid (proxied → pipeline)' })
  hybridSearch(@Body() dto: SearchRequestDto, @Request() req: AuthRequest) {
    return this.aiProxyService.hybridSearch(dto, req.user?.sub);
  }

  // ─── Text-to-SQL — SUPPORT, ADMIN only ───────────────────────────────────

  @Post('sql')
  @Roles('SUPPORT', 'ADMIN')
  @ApiOperation({
    summary: 'Chuyển ngôn ngữ tự nhiên sang SQL (proxied → pipeline)',
  })
  textToSql(@Body() dto: SqlRequestDto, @Request() req: AuthRequest) {
    return this.aiProxyService.textToSql(dto, req.user?.sub);
  }

  // ─── OCR — SUPPORT, ADMIN only — async via BullMQ ────────────────────────

  @Post('ocr')
  @Roles('SUPPORT', 'ADMIN')
  @ApiOperation({
    summary: 'Xử lý ảnh OCR bất đồng bộ — trả về jobId (BullMQ)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async submitOcr(@UploadedFile() file: unknown) {
    if (!file) throw new BadRequestException('No file uploaded');
    const f = file as MulterFile;
    const jobId = await this.aiTasksService.addOcrJob(
      f.originalname,
      f.buffer,
      f.mimetype,
    );
    return { success: true, jobId, message: 'OCR task queued' };
  }

  // ─── Evaluate — ADMIN only — async via BullMQ ────────────────────────────

  @Post('evaluate')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Self-evaluation bất đồng bộ — trả về jobId (BullMQ)',
  })
  async submitEvaluate() {
    const jobId = await this.aiTasksService.addEvalJob();
    return { success: true, jobId, message: 'Evaluation task queued' };
  }
}
