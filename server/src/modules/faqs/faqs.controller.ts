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
import { FaqsService } from './faqs.service';
import { CreateFaqDto, UpdateFaqDto } from './dto/faq.dto';
import { Faq } from './entities/faq.entity';

@ApiTags('Faqs')
@Controller('faqs')
export class FaqsController {
  constructor(private readonly faqsService: FaqsService) {}

  @Post()
  @ApiOperation({ summary: 'Create FAQ' })
  @ApiResponse({ status: 201, type: Faq })
  create(@Body() createFaqDto: CreateFaqDto) {
    return this.faqsService.create(createFaqDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all FAQs' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, type: [Faq] })
  findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.faqsService.findAll(limit || 10, offset || 0);
  }

  @Get('count/all')
  @ApiOperation({ summary: 'Count all FAQs' })
  @ApiResponse({ status: 200, type: Number })
  countAll() {
    return this.faqsService.countAll();
  }

  @Get('count/by')
  @ApiOperation({ summary: 'Count FAQs by filter' })
  @ApiQuery({ name: 'topic', required: false })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  @ApiResponse({ status: 200, type: Number })
  countBy(
    @Query('topic') topic?: string,
    @Query('is_active') isActive?: string,
  ) {
    const filters: Record<string, any> = {};
    if (topic) filters.topic = topic;
    if (isActive) filters.is_active = isActive === 'true';
    return this.faqsService.countBy(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get FAQ by ID' })
  @ApiResponse({ status: 200, type: Faq })
  findOne(@Param('id') id: string) {
    return this.faqsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update FAQ' })
  @ApiResponse({ status: 200, type: Faq })
  update(
    @Param('id') id: string,
    @Body() updateFaqDto: UpdateFaqDto,
  ) {
    return this.faqsService.update(id, updateFaqDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete FAQ' })
  @ApiResponse({ status: 200, description: 'FAQ deleted' })
  remove(@Param('id') id: string) {
    return this.faqsService.remove(id);
  }
}
