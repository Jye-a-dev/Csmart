import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AiLogsService } from './ai-logs.service';
import { CreateAiRequestLogDto, UpdateAiRequestLogDto } from './dto/ai-log.dto';
import { AiRequestLog } from './entities/ai-log.entity';

@ApiTags('AiLogs')
@Controller('ai-logs')
export class AiLogsController {
  constructor(private readonly aiLogsService: AiLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create AI request log' })
  @ApiResponse({ status: 201, type: AiRequestLog })
  create(@Body() createAiRequestLogDto: CreateAiRequestLogDto) {
    return this.aiLogsService.create(createAiRequestLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all AI request logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, type: [AiRequestLog] })
  findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.aiLogsService.findAll(limit || 10, offset || 0);
  }

  @Get('count/all')
  @ApiOperation({ summary: 'Count all AI request logs' })
  @ApiResponse({ status: 200, type: Number })
  countAll() {
    return this.aiLogsService.countAll();
  }

  @Get('count/by')
  @ApiOperation({ summary: 'Count AI request logs by filter' })
  @ApiQuery({ name: 'endpoint', required: false })
  @ApiQuery({ name: 'flag_for_review', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: Number })
  countBy(
    @Query('endpoint') endpoint?: string,
    @Query('flag_for_review') flagForReview?: string,
  ) {
    const filters: Record<string, any> = {};
    if (endpoint) filters.endpoint = endpoint;
    if (flagForReview) filters.flag_for_review = flagForReview === 'true';
    return this.aiLogsService.countBy(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get AI request log by ID' })
  @ApiResponse({ status: 200, type: AiRequestLog })
  findOne(@Param('id') id: string) {
    return this.aiLogsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update AI request log' })
  @ApiResponse({ status: 200, type: AiRequestLog })
  update(
    @Param('id') id: string,
    @Body() updateAiRequestLogDto: UpdateAiRequestLogDto,
  ) {
    return this.aiLogsService.update(id, updateAiRequestLogDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete all AI request logs' })
  @ApiResponse({ status: 200, description: 'All logs deleted' })
  removeAll() {
    return this.aiLogsService.removeAll();
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete AI request log' })
  @ApiResponse({ status: 200, description: 'Log deleted' })
  remove(@Param('id') id: string) {
    return this.aiLogsService.remove(id);
  }
}
