'use client';

import Link from 'next/link';
import { Sparkles, ShieldCheck, Truck } from 'lucide-react';

export default function AuthVisualSide() {
  return (
    <div className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-10 overflow-hidden bg-zinc-950 text-white">
      {/* High-res Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"
          alt="CSMART Lifestyle"
          className="w-full h-full object-cover object-center opacity-40 scale-105 hover:scale-100 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-orange-600/30 via-transparent to-transparent" />
      </div>

      {/* Top Brand Tag */}
      <div className="relative z-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 bg-linear-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-extrabold text-xl rounded-2xl shadow-lg shadow-orange-600/30 group-hover:rotate-6 transition-transform">
            CS
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-white block leading-none">
              CSMART
            </span>
            <span className="text-[10px] font-bold text-orange-400 tracking-widest uppercase mt-0.5 block">
              Storefront
            </span>
          </div>
        </Link>
      </div>

      {/* Center Feature Highlight */}
      <div className="relative z-10 space-y-6 my-auto pt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-orange-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Thế Giới Mua Sắm Thế Hệ Mới</span>
        </div>

        <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight tracking-tight text-white">
          Nâng tầm phong cách sống cùng{' '}
          <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-300">
            CSMART
          </span>
        </h2>

        <p className="text-zinc-300 text-sm leading-relaxed font-light">
          Trải nghiệm tìm kiếm bằng hình ảnh, tích điểm đổi quà độc quyền và tận hưởng dịch vụ giao hàng hỏa tốc trong 24 giờ.
        </p>

        {/* Social Proof Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-2xl font-extrabold text-white font-mono">10,000+</span>
            <p className="text-xs text-zinc-400 mt-0.5">Sản phẩm chính hãng</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
            <span className="text-2xl font-extrabold text-amber-400 font-mono">4.9 / 5.0</span>
            <p className="text-xs text-zinc-400 mt-0.5">Mức độ hài lòng</p>
          </div>
        </div>
      </div>

      {/* Bottom Trust Badges */}
      <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Bảo mật chuẩn SSL 256-bit</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-orange-400" />
          <span>Freeship từ 499k</span>
        </div>
      </div>
    </div>
  );
}
