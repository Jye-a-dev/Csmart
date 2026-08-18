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
import { OcrRecordsService } from './ocr-records.service';
import { CreateOcrRecordDto, UpdateOcrRecordDto } from './dto/ocr-record.dto';
import { OcrRecord } from './entities/ocr-record.entity';

@ApiTags('OcrRecords')
@Controller('ocr-records')
export class OcrRecordsController {
  constructor(private readonly ocrRecordsService: OcrRecordsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new saved OCR record' })
  @ApiResponse({ status: 201, type: OcrRecord })
  create(@Body() dto: CreateOcrRecordDto) {
    return this.ocrRecordsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get list of saved OCR records' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'document_type', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, type: [OcrRecord] })
  findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @Query('document_type') documentType?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.ocrRecordsService.findAll(
      limit || 50,
      offset || 0,
      documentType,
      status,
      search,
    );
  }

  @Get('count/all')
  @ApiOperation({ summary: 'Count all saved OCR records' })
  @ApiResponse({ status: 200, type: Number })
  countAll() {
    return this.ocrRecordsService.countAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get OCR record details by ID' })
  @ApiResponse({ status: 200, type: OcrRecord })
  findOne(@Param('id') id: string) {
    return this.ocrRecordsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing OCR record' })
  @ApiResponse({ status: 200, type: OcrRecord })
  update(@Param('id') id: string, @Body() dto: UpdateOcrRecordDto) {
    return this.ocrRecordsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an OCR record' })
  @ApiResponse({ status: 200, description: 'OCR record deleted' })
  remove(@Param('id') id: string) {
    return this.ocrRecordsService.remove(id);
  }
}
