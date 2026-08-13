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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { Payment } from './entities/payment.entity';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create payment record' })
  @ApiResponse({ status: 201, type: Payment })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, type: [Payment] })
  findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.paymentsService.findAll(limit || 10, offset || 0);
  }

  @Get('count/all')
  @ApiOperation({ summary: 'Count all payments' })
  @ApiResponse({ status: 200, type: Number })
  countAll() {
    return this.paymentsService.countAll();
  }

  @Get('count/by')
  @ApiOperation({ summary: 'Count payments by filter' })
  @ApiQuery({ name: 'order_id', required: false, type: String })
  @ApiQuery({ name: 'payment_status', required: false })
  @ApiQuery({ name: 'payment_method', required: false })
  @ApiResponse({ status: 200, type: Number })
  countBy(
    @Query('order_id') orderId?: string,
    @Query('payment_status') status?: string,
    @Query('payment_method') method?: string,
  ) {
    const filters: Record<string, any> = {};
    if (orderId) filters.order_id = orderId;
    if (status) filters.payment_status = status;
    if (method) filters.payment_method = method;
    return this.paymentsService.countBy(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiResponse({ status: 200, type: Payment })
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment' })
  @ApiResponse({ status: 200, type: Payment })
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment' })
  @ApiResponse({ status: 200, description: 'Payment deleted' })
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
