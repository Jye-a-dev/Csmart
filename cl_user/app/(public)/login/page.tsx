'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import {
  Mail,
  KeyRound,
  User as UserIcon,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, register, loading, isAuthenticated } = useAuth();

  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await login({ email: email.trim(), password });
      window.dispatchEvent(new Event('auth-change'));
      setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setFormError(msg);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      window.dispatchEvent(new Event('auth-change'));
      setSuccessMsg('Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => {
        router.push('/');
      }, 500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Đăng ký thất bại. Email có thể đã tồn tại.';
      setFormError(msg);
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-zinc-50/50">
      <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden">
        {/* Header Bar */}
        <div className="bg-linear-to-r from-orange-600 via-orange-500 to-amber-500 p-8 text-white relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-orange-100 hover:text-white mb-4 transition-colors font-semibold"
          >
            <ArrowLeft size={14} />
            <span>Quay lại trang chủ</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            CSMART Store
          </h1>
          <p className="text-orange-100 text-xs mt-1.5">
            Cổng đăng nhập và quản lý tài khoản thành viên
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {/* Tab Switcher */}
          <div className="flex border-b border-zinc-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setTab('LOGIN');
                setFormError(null);
              }}
              className={`flex-1 pb-3 text-center text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                tab === 'LOGIN'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('REGISTER');
                setFormError(null);
              }}
              className={`flex-1 pb-3 text-center text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                tab === 'REGISTER'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-zinc-400 hover:text-zinc-700'
              }`}
            >
              Đăng Ký
            </button>
          </div>

          {/* Alert Messages */}
          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {formError}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@csmart.com hoặc email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Demo Account Chips */}
              <div className="pt-1 pb-1">
                <div className="text-[11px] font-semibold text-zinc-500 mb-2 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-orange-500" />
                  <span>Tài khoản mẫu thử nghiệm:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('customer@csmart.com')}
                    className="px-2.5 py-1 text-[11px] font-medium bg-zinc-100 hover:bg-orange-50 hover:text-orange-600 rounded-lg border border-zinc-200 transition-colors"
                  >
                    Khách hàng (customer)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin@csmart.com')}
                    className="px-2.5 py-1 text-[11px] font-medium bg-zinc-100 hover:bg-orange-50 hover:text-orange-600 rounded-lg border border-zinc-200 transition-colors"
                  >
                    Quản trị (admin)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Đang đăng nhập...' : 'Đăng Nhập Ngay'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {/* TAB 2: REGISTER */}
          {tab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Họ và tên
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@domain.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Số điện thoại
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-3 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 mt-2 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Đang đăng ký...' : 'Tạo Tài Khoản'}</span>
                <ShieldCheck size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
