'use client';

import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  errorMsg: string | null;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe,
  errorMsg,
  loading,
  onSubmit
}: LoginFormProps) {
  return (
    <div className="lg:col-span-7 bg-white border-4 border-[#09090B] p-8 shadow-[8px_8px_0px_0px_#09090B] flex flex-col justify-between">
      <div>
        {/* Badge */}
        <div className="inline-block border-2 border-[#F97316] bg-[#F97316]/5 text-[#F97316] px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider mb-4">
          ● CỔNG QUẢN TRỊ NỘI BỘ
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black text-[#09090B] uppercase tracking-tight mb-2">
          Đăng Nhập Tài Khoản
        </h2>
        <p className="text-xs text-zinc-600 leading-relaxed mb-6">
          Vui lòng nhập thông tin quản trị viên được cấp để truy cập hệ thống xử lý đơn hàng và quản lý cửa hàng.
        </p>

        {/* Separation Line */}
        <div className="h-0.5 w-full bg-[#09090B] mb-6" />

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 border-2 border-[#09090B] bg-rose-50 text-rose-700 font-mono text-xs shadow-[2px_2px_0px_0px_#09090B]">
            <strong>LỖI:</strong> {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-mono font-bold text-[#09090B] uppercase mb-1">
              TÊN ĐĂNG NHẬP / EMAIL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@csmart.vn"
                className="w-full pl-10 pr-4 py-3 border-2 border-[#09090B] focus:outline-none focus:bg-zinc-50 font-mono text-sm bg-white shadow-[2px_2px_0px_0px_#09090B]"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-mono font-bold text-[#09090B] uppercase">
                MẬT KHẨU
              </label>
              <a href="#" className="text-xs font-mono text-[#F97316] hover:underline">
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                <Lock size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border-2 border-[#09090B] focus:outline-none focus:bg-zinc-50 font-mono text-sm bg-white shadow-[2px_2px_0px_0px_#09090B]"
                disabled={loading}
              />
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-2 border-[#09090B] text-[#F97316] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#F97316]"
            />
            <label htmlFor="remember" className="text-xs font-mono font-bold text-[#09090B] uppercase cursor-pointer select-none">
              Ghi nhớ đăng nhập
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-brutal flex items-center justify-center gap-2 bg-[#F97316] text-white font-mono font-bold px-6 py-3.5 uppercase text-sm cursor-pointer border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Vào trang quản trị
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Left Box Footer */}
      <div className="mt-8 pt-4 border-t border-dashed border-zinc-300 flex items-center justify-between text-[10px] font-mono text-zinc-500">
        <span>Kết nối an toàn SSL 256-bit</span>
        <span className="flex items-center gap-1 text-emerald-600 font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Sẵn sàng hoạt động
        </span>
      </div>
    </div>
  );
}
