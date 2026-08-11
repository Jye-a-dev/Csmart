import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { HitlService } from './hitl.service';
import {
  ApproveReviewDto,
  RejectReviewDto,
  LabelReviewDto,
} from './dto/hitl.dto';
import type { HitlStatus } from './entities/review-queue.entity';

interface AuthRequest extends Request {
  user?: { sub: number; email: string; role: string };
}

@ApiTags('HITL Review Queue')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hitl')
export class HitlController {
  constructor(private readonly hitlService: HitlService) {}

  // ─── Danh sách queue — SUPPORT, ADMIN ─────────────────────────────────────

  @Get('queue')
  @Roles('SUPPORT', 'ADMIN')
  @ApiOperation({ summary: 'Lấy danh sách HITL review queue' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'LABELLED'],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  findAll(
    @Query('status') status?: string,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.hitlService.findAll(
      status as HitlStatus | undefined,
      limit ?? 20,
      offset ?? 0,
    );
  }

  // ─── Đếm theo status — SUPPORT, ADMIN ────────────────────────────────────

  @Get('queue/count')
  @Roles('SUPPORT', 'ADMIN')
  @ApiOperation({ summary: 'Đếm số lượng items theo status' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'LABELLED'],
  })
  count(@Query('status') status?: string) {
    return this.hitlService
      .count(status as HitlStatus | undefined)
      .then((count) => ({ count }));
  }

  // ─── Chi tiết 1 item — SUPPORT, ADMIN ────────────────────────────────────

  @Get('queue/:id')
  @Roles('SUPPORT', 'ADMIN')
  @ApiOperation({ summary: 'Xem chi tiết một review item' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.hitlService.findOne(id);
  }

  // ─── Approve — SUPPORT, ADMIN ─────────────────────────────────────────────

  @Patch('queue/:id/approve')
  @Roles('SUPPORT', 'ADMIN')
  @ApiOperation({ summary: 'Duyệt kết quả AI — APPROVED' })
  @ApiResponse({ status: 200, description: 'Item marked as APPROVED' })
  approve(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ApproveReviewDto,
    @Request() req: AuthRequest,
  ) {
    return this.hitlService.approve(id, req.user!.sub, dto);
  }

  // ─── Reject — SUPPORT, ADMIN ──────────────────────────────────────────────

  @Patch('queue/:id/reject')
  @Roles('SUPPORT', 'ADMIN')
  @ApiOperation({ summary: 'Từ chối kết quả AI — REJECTED' })
  @ApiResponse({ status: 200, description: 'Item marked as REJECTED' })
  reject(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RejectReviewDto,
    @Request() req: AuthRequest,
  ) {
    return this.hitlService.reject(id, req.user!.sub, dto);
  }

  // ─── Label — ADMIN only ───────────────────────────────────────────────────

  @Patch('queue/:id/label')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Gán nhãn đúng cho kết quả AI — LABELLED (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Item marked as LABELLED with corrected_label',
  })
  label(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LabelReviewDto,
    @Request() req: AuthRequest,
  ) {
    return this.hitlService.label(id, req.user!.sub, dto);
  }

  // ─── Export fine-tune dataset — ADMIN only ────────────────────────────────

  @Get('export')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Export LABELLED records → .jsonl cho fine-tune Qwen2.5 (Admin only)',
  })
  async export(@Res() res: import('express').Response) {
    const jsonl = await this.hitlService.exportFineTuneDataset();
    const filename = `finetune_dataset_${Date.now()}.jsonl`;
    res.setHeader('Content-Type', 'application/jsonlines');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(jsonl);
  }
}
