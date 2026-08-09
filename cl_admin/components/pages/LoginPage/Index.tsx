'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import {
  Mail,
  Lock,
  Loader2,
  ArrowRight,
  Headphones,
  ShoppingBag,
  CheckSquare,
  Database,
  Grid
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    try {
      const res = await login({ email, password });
      if (res.user.role === 'ADMIN') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.';
      setErrorMsg(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f4ef] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] flex flex-col justify-between p-0 font-sans">
      
      {/* Top Navbar */}
      <header className="w-full bg-white border-b-2 border-[#09090B] px-6 py-4 md:px-12 flex items-center justify-between shadow-[0_2px_0_0_#09090B]">
        <div className="flex items-center gap-3">
          <div className="bg-[#09090B] text-white p-2 border border-[#09090B] font-mono font-black text-sm">
            CS
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold tracking-tight text-base text-[#09090B] leading-none uppercase">
              CSMART_Admin
            </span>
            <span className="text-[10px] text-zinc-500 font-medium mt-1">
              Hệ thống quản lý bán hàng
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 border-2 border-[#09090B] bg-[#FAFAFA] text-[#09090B] px-4 py-1.5 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#09090B]">
          <Headphones size={14} className="text-[#F97316]" />
          HỖ TRỢ: 1900 1234
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">
          
          {/* Left Block: Login Form (7 Columns) */}
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
              <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Right Block: Telemetry Features (5 Columns) */}
          <div className="lg:col-span-5 bg-zinc-950 text-white border-4 border-[#09090B] p-8 shadow-[8px_8px_0px_0px_#F97316] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                <div className="flex items-center gap-2 text-[#F97316] font-mono text-xs font-bold uppercase">
                  <Grid size={14} />
                  TỔNG QUAN TÍNH NĂNG
                </div>
                <span className="bg-[#F97316] text-[#09090B] font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm">
                  v2.4
                </span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-black uppercase tracking-tight mb-8 leading-snug">
                Trung tâm điều hành cửa hàng CSMART
              </h3>

              {/* Features List */}
              <div className="space-y-4">
                
                {/* Feature 1 */}
                <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-sm flex items-start gap-3">
                  <div className="p-2 border border-zinc-800 bg-zinc-950 text-[#F97316] rounded-sm mt-0.5">
                    <ShoppingBag size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase mb-1">
                      Quản lý đơn hàng
                    </h4>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Xem và cập nhật trạng thái các đơn hàng cần giao nhanh chóng.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-sm flex items-start gap-3">
                  <div className="p-2 border border-zinc-800 bg-zinc-950 text-[#F97316] rounded-sm mt-0.5">
                    <CheckSquare size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase mb-1">
                      Duyệt xử lý yêu cầu
                    </h4>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Kiểm tra danh sách đơn hàng được gợi ý cần điều chỉnh hoặc hủy.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="border border-zinc-800 bg-zinc-900/50 p-4 rounded-sm flex items-start gap-3">
                  <div className="p-2 border border-zinc-800 bg-zinc-950 text-[#F97316] rounded-sm mt-0.5">
                    <Database size={14} />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono font-bold text-white uppercase mb-1">
                      Cập nhật kho hàng
                    </h4>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Theo dõi số lượng tồn kho sản phẩm chính xác theo thời gian thực.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right Box Footer */}
            <div className="mt-8 pt-4 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>Hệ thống: CSMART_Admin</span>
              <span className="text-emerald-400 font-bold tracking-wider">ONLINE</span>
            </div>
          </div>

        </div>
      </main>

      {/* Main Page Footer */}
      <footer className="w-full bg-white border-t-2 border-[#09090B] px-6 py-4 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-[0_-2px_0_0_#09090B] text-[10px] font-mono text-zinc-500 uppercase font-bold">
        <span>© 2026 CSMART_Admin. Bản quyền nội bộ.</span>
        <span className="flex items-center gap-1.5">
          Trạng thái: Hoạt động bình thường
        </span>
      </footer>

    </div>
  );
}
