import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentsRepository } from './repositories/payments.repository';
import {
  CreatePaymentDto,
  ProcessPaymentDto,
  UpdatePaymentDto,
} from './dto/payment.dto';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from './entities/payment.entity';
import * as crypto from 'crypto';

export interface ProcessPaymentResult {
  success: boolean;
  payment: Payment;
  pay_url?: string;
  qr_code_url?: string;
  deeplink?: string;
  message: string;
  is_mock: boolean;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly configService: ConfigService,
  ) {}

  async processCheckout(dto: ProcessPaymentDto): Promise<ProcessPaymentResult> {
    const { order_id, amount, payment_method, return_url } = dto;
    const txnCode = `TXN-${payment_method}-${Date.now()}`;

    // 1. Tạo bản ghi payment ban đầu trong DB
    const initialPayment = await this.paymentsRepository.createPayment({
      order_id,
      amount,
      payment_method,
      payment_status: PaymentStatus.PENDING,
      transaction_code: txnCode,
    });

    switch (payment_method) {
      case PaymentMethod.MOMO:
        return this.handleMomoPayment(initialPayment, amount, return_url);
      case PaymentMethod.BANK_TRANSFER:
        return this.handleBankTransferPayment(initialPayment, amount);
      case PaymentMethod.COD:
      default:
        return this.handleCodPayment(initialPayment);
    }
  }

  private async handleMomoPayment(
    payment: Payment,
    amount: number,
    returnUrl?: string,
  ): Promise<ProcessPaymentResult> {
    const partnerCode = this.configService.get<string>('MOMO_PARTNER_CODE');
    const accessKey = this.configService.get<string>('MOMO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MOMO_SECRET_KEY');
    const endpoint =
      this.configService.get<string>('MOMO_ENDPOINT') ||
      'https://test-payment.momo.vn/v2/gateway/api/create';

    // Nếu thiếu cấu hình .env -> tự động sử dụng MoMo Mock Mode
    if (!partnerCode || !accessKey || !secretKey) {
      this.logger.warn(
        'Cấu hình MoMo chưa có trong .env. Sử dụng MoMo Mock Mode.',
      );
      const mockPayUrl = `https://test-payment.momo.vn/pay/mock?orderId=${payment.order_id}&amount=${amount}`;
      const mockDeeplink = `momo://app?action=pay&amount=${amount}&orderId=${payment.order_id}`;

      return {
        success: true,
        payment,
        pay_url: mockPayUrl,
        deeplink: mockDeeplink,
        message:
          'Khởi tạo thanh toán MoMo (Mock Mode) thành công. Thiết lập .env để dùng tài khoản thực.',
        is_mock: true,
      };
    }

    // Tích hợp thật qua API MoMo Gateway
    try {
      const requestId = `${partnerCode}-${Date.now()}`;
      const orderId = payment.id;
      const orderInfo = `Thanh toán đơn hàng CsmartAI #${payment.order_id}`;
      const redirectUrl = returnUrl || 'http://localhost:5000/orders/success';
      const ipnUrl = 'http://localhost:3000/payments/momo/callback';
      const requestType = 'captureWallet';
      const extraData = '';

      const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
      const signature = crypto
        .createHmac('sha256', secretKey)
        .update(rawSignature)
        .digest('hex');

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerCode,
          accessKey,
          requestId,
          amount,
          orderId,
          orderInfo,
          redirectUrl,
          ipnUrl,
          extraData,
          requestType,
          signature,
          lang: 'vi',
        }),
      });

      const data = (await response.json()) as {
        payUrl?: string;
        deeplink?: string;
      };
      if (data && data.payUrl) {
        return {
          success: true,
          payment,
          pay_url: data.payUrl,
          deeplink: data.deeplink,
          message: 'Khởi tạo thanh toán cổng MoMo thực tế thành công.',
          is_mock: false,
        };
      }
    } catch (err) {
      this.logger.error(`Lỗi gọi MoMo Gateway API: ${String(err)}`);
    }

    // Fallback sang mock nếu API bị lỗi kết nối
    return {
      success: true,
      payment,
      pay_url: `https://test-payment.momo.vn/pay/mock?orderId=${payment.order_id}&amount=${amount}`,
      message: 'MoMo API thực tế bị gián đoạn. Chuyển sang MoMo Mock Mode.',
      is_mock: true,
    };
  }

  private handleBankTransferPayment(
    payment: Payment,
    amount: number,
  ): ProcessPaymentResult {
    const bankId = this.configService.get<string>('BANK_ID') || 'MB';
    const accountNo = this.configService.get<string>('BANK_ACCOUNT_NO');
    const accountName =
      this.configService.get<string>('BANK_ACCOUNT_NAME') ||
      'CSMART AI ECOMMERCE';
    const isConfigured = Boolean(accountNo);

    const targetBankId = isConfigured ? bankId : '970422'; // 970422 = MBBank
    const targetAccountNo = accountNo || '123456789';
    const targetAccountName = encodeURIComponent(accountName);
    const addInfo = encodeURIComponent(`CSMART ${payment.transaction_code}`);

    // Tạo mã QR VietQR chuẩn
    const qrCodeUrl = `https://img.vietqr.io/image/${targetBankId}-${targetAccountNo}-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${targetAccountName}`;

    return {
      success: true,
      payment,
      qr_code_url: qrCodeUrl,
      message: isConfigured
        ? 'Tạo mã VietQR chuyển khoản ngân hàng thành công.'
        : 'Chưa cài đặt BANK_ACCOUNT_NO trong .env. Sử dụng VietQR Mock tài khoản mặc định.',
      is_mock: !isConfigured,
    };
  }

  private handleCodPayment(payment: Payment): ProcessPaymentResult {
    return {
      success: true,
      payment,
      message: 'Đơn hàng chọn phương thức Thanh toán khi nhận hàng (COD).',
      is_mock: false,
    };
  }

  async create(dto: CreatePaymentDto): Promise<Payment> {
    return this.paymentsRepository.createPayment(dto);
  }

  async findAll(limit?: number, offset?: number): Promise<Payment[]> {
    return this.paymentsRepository.findAllPayments(limit, offset);
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findPaymentById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async update(id: string, dto: UpdatePaymentDto): Promise<Payment> {
    await this.findOne(id);
    const updated = await this.paymentsRepository.updatePayment(id, dto);
    if (!updated) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.paymentsRepository.deletePayment(id);
  }

  async countAll(): Promise<number> {
    return this.paymentsRepository.countAll('payments');
  }

  async countBy(filters: Record<string, any>): Promise<number> {
    return this.paymentsRepository.countBy('payments', filters);
  }
}
