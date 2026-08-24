'use client';

import { useLandingConfig } from '@/hooks';
import { useAuthModal } from '@/contexts/AuthModalContext';

function getGradientStyle(gradientClass?: string): React.CSSProperties {
  const g = gradientClass || '';
  if (g.includes('rose') || g.includes('red')) {
    return {
      background: 'linear-gradient(135deg, #e11d48 0%, #ef4444 50%, #f97316 100%)',
    };
  }
  if (g.includes('indigo') || g.includes('blue')) {
    return {
      background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #06b6d4 100%)',
    };
  }
  if (g.includes('emerald') || g.includes('teal')) {
    return {
      background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #06b6d4 100%)',
    };
  }
  if (g.includes('zinc') || g.includes('black') || g.includes('900')) {
    return {
      background: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #09090b 100%)',
    };
  }
  // Default warm orange gradient
  return {
    background: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #f59e0b 100%)',
  };
}

interface HeroSectionProps {
  onSearchChipClick?: (keyword: string) => void;
  onOpenChat?: () => void;
}

export default function HeroSection({}: HeroSectionProps) {
  const { config } = useLandingConfig();
  const { requireAuth } = useAuthModal();
  const {
    pillTag,
    headline,
    description,
    primaryCtaText,
    primaryCtaLink,
    secondaryCtaText,
    secondaryCtaLink,
    gradientClass,
    imageUrl,
    imageMode = 'background',
  } = config.hero;

  const baseGradientStyle = getGradientStyle(gradientClass);

  const containerStyle: React.CSSProperties =
    imageUrl && imageMode === 'background'
      ? {
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.6) 100%), url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : baseGradientStyle;

  const handlePrimaryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(() => {
      const targetId = (primaryCtaLink || '#featured-products').replace('#', '');
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 'Vui lòng đăng nhập để nhận ưu đãi mua sắm');
  };

  const handleSecondaryClick = (e: React.MouseEvent) => {
    e.preventDefault();
    requireAuth(() => {
      const targetId = (secondaryCtaLink || '#categories').replace('#', '');
      const el = document.getElementById(targetId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 'Vui lòng đăng nhập để xem danh mục sản phẩm');
  };

  return (
    <section className="w-full pt-6 pb-4 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div
          style={containerStyle}
          className="relative overflow-hidden rounded-3xl bg-orange-600 text-white px-8 py-12 md:px-14 md:py-16 shadow-lg shadow-orange-600/15"
        >
          {/* Subtle background blur accents */}
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-64 h-64 bg-black/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column */}
            <div className={`${imageUrl && imageMode === 'right-side' ? 'lg:col-span-7' : 'lg:col-span-12 max-w-2xl'} space-y-5`}>
              {/* Pill Tag */}
              {pillTag && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider border border-white/25">
                  <span>{pillTag}</span>
                </div>
              )}

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-white whitespace-pre-line">
                {headline}
              </h1>

              {/* Sub-headline */}
              <p className="text-orange-50 text-sm sm:text-base font-normal leading-relaxed max-w-xl">
                {description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                {primaryCtaText && (
                  <button
                    type="button"
                    onClick={handlePrimaryClick}
                    className="px-6 py-3 bg-white hover:bg-orange-50 text-zinc-900 font-bold text-sm rounded-full shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    {primaryCtaText}
                  </button>
                )}
                {secondaryCtaText && (
                  <button
                    type="button"
                    onClick={handleSecondaryClick}
                    className="px-6 py-3 bg-orange-700/70 hover:bg-orange-700 border border-white/30 text-white font-bold text-sm rounded-full backdrop-blur-sm active:scale-95 transition-all cursor-pointer"
                  >
                    {secondaryCtaText}
                  </button>
                )}
              </div>
            </div>

            {/* Right Showcase Image Column */}
            {imageUrl && imageMode === 'right-side' && (
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative group max-w-xs sm:max-w-sm w-full">
                  <div className="absolute -inset-1 bg-white/30 rounded-3xl blur-md group-hover:blur-lg transition-all opacity-70" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={headline || 'Hero Showcase'}
                    className="relative w-full h-56 sm:h-72 object-cover object-center rounded-2xl shadow-2xl border-2 border-white/40 group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
