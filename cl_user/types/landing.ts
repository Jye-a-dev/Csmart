export interface LandingHeroConfig {
  pillTag: string;
  headline: string;
  description: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  gradientClass: string;
  imageUrl?: string;
  imageMode?: 'background' | 'right-side';
}

export interface LandingAnnouncementConfig {
  message: string;
  hotline: string;
  faqLinkText: string;
}

export interface LandingTrustBadge {
  id: string;
  title: string;
  subtitle: string;
  icon: 'truck' | 'shield' | 'refresh' | 'headset';
}

export interface LandingConfig {
  announcement: LandingAnnouncementConfig;
  hero: LandingHeroConfig;
  trustBadges: LandingTrustBadge[];
  featuredCategoryIds?: string[];
}

export const DEFAULT_LANDING_CONFIG: LandingConfig = {
  announcement: {
    message: 'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 499.000đ | Đổi trả trong 30 ngày',
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
