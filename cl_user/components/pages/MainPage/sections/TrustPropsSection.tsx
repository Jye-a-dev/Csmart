'use client';

import { Truck, ShieldCheck, RefreshCw, Headset, Sparkles, type LucideIcon } from 'lucide-react';
import { useLandingConfig } from '@/hooks';
import type { LandingTrustBadge } from '@/types/landing';

const ICON_MAP: Record<string, LucideIcon> = {
  truck: Truck,
  shield: ShieldCheck,
  refresh: RefreshCw,
  headset: Headset,
};

export default function TrustPropsSection() {
  const { config } = useLandingConfig();
  const badges: LandingTrustBadge[] = config.trustBadges || [];

  return (
    <section id="trust-props" className="w-full py-4 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-white border border-zinc-200 p-5 md:p-6 shadow-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {badges.map((prop: LandingTrustBadge, idx: number) => {
              const Icon = ICON_MAP[prop.icon] || Sparkles;
              return (
                <div key={prop.id || idx} className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 leading-tight">
                      {prop.title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {prop.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
