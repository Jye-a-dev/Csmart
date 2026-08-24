import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export const DEFAULT_LANDING_CONFIG = {
  announcement: {
    message:
      'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 499.000đ | Đổi trả trong 30 ngày',
    hotline: '1900 1000',
    faqLinkText: 'Trợ giúp & FAQ',
  },
  hero: {
    pillTag: 'BỘ SƯU TẬP MÙA HÈ 2026',
    headline: 'Nâng Tầm Phong Cách Sống\nMỗi Ngày Cùng CSMART',
    description:
      'Hàng ngàn sản phẩm thời trang, thiết bị gia dụng và phụ kiện cao cấp chính hãng. Giao hàng hỏa tốc trong 24 giờ.',
    primaryCtaText: 'Mua Sắm Ngay',
    primaryCtaLink: '#featured-products',
    secondaryCtaText: 'Xem Danh Mục',
    secondaryCtaLink: '#categories',
    gradientClass: 'from-orange-600 via-orange-500 to-amber-500',
  },
  trustBadges: [
    {
      id: 'tb-1',
      title: 'Giao Hàng Miễn Phí',
      subtitle: 'Cho đơn hàng từ 499k',
      icon: 'truck',
    },
    {
      id: 'tb-2',
      title: '100% Chính Hãng',
      subtitle: 'Cam kết chất lượng cao',
      icon: 'shield',
    },
    {
      id: 'tb-3',
      title: '30 Ngày Đổi Trả',
      subtitle: 'Thủ tục nhanh chóng',
      icon: 'refresh',
    },
    {
      id: 'tb-4',
      title: 'Hỗ Trợ 24/7',
      subtitle: 'Tư vấn tận tình chu đáo',
      icon: 'headset',
    },
  ],
};

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly filePath = path.resolve(
    process.cwd(),
    'data',
    'landing_config.json',
  );
  private cachedConfig: Record<string, unknown> | null = null;

  constructor() {
    this.ensureDataDirectory();
  }

  private ensureDataDirectory() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    } catch (err) {
      this.logger.error(
        'Failed to ensure data directory for landing config',
        err,
      );
    }
  }

  getHello(): string {
    return 'Hello World!';
  }

  getLandingConfig(): Record<string, unknown> {
    if (this.cachedConfig) {
      return this.cachedConfig;
    }
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw) as Record<string, unknown>;
        const config = { ...DEFAULT_LANDING_CONFIG, ...parsed };
        this.cachedConfig = config;
        return config;
      }
    } catch (err) {
      this.logger.warn(
        'Failed reading landing_config.json, returning default config',
        err,
      );
    }
    return DEFAULT_LANDING_CONFIG;
  }

  updateLandingConfig(
    payload: Record<string, unknown>,
  ): Record<string, unknown> {
    try {
      this.ensureDataDirectory();
      this.cachedConfig = { ...DEFAULT_LANDING_CONFIG, ...payload };
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(this.cachedConfig, null, 2),
        'utf-8',
      );
      return this.cachedConfig;
    } catch (err) {
      this.logger.error('Failed saving landing_config.json', err);
      this.cachedConfig = { ...DEFAULT_LANDING_CONFIG, ...payload };
      return this.cachedConfig;
    }
  }

  resetLandingConfig(): Record<string, unknown> {
    try {
      this.ensureDataDirectory();
      this.cachedConfig = { ...DEFAULT_LANDING_CONFIG };
      fs.writeFileSync(
        this.filePath,
        JSON.stringify(DEFAULT_LANDING_CONFIG, null, 2),
        'utf-8',
      );
      return DEFAULT_LANDING_CONFIG;
    } catch (err) {
      this.logger.error('Failed resetting landing_config.json', err);
      return DEFAULT_LANDING_CONFIG;
    }
  }
}
