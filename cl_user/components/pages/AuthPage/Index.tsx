'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { CheckCircle2 } from 'lucide-react';
import AuthVisualSide from './sections/AuthVisualSide';
import AuthHeaderNav from './sections/AuthHeaderNav';
import AuthTabSwitcher from './sections/AuthTabSwitcher';
import AuthSocialButtons from './sections/AuthSocialButtons';
import LoginForm from './sections/LoginForm';
import RegisterForm from './sections/RegisterForm';
import AuthFooter from './sections/AuthFooter';

interface AuthPageProps {
  mode?: 'LOGIN' | 'REGISTER';
}

export default function AuthPage({ mode = 'LOGIN' }: AuthPageProps) {
  const router = useRouter();
  const { login, register, loading, isAuthenticated } = useAuth();

  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated()) {
      router.replace('/user');
    }
  }, [isAuthenticated, router]);

  const handleLoginSubmit = async ({
    emailOrPhone,
    password,
  }: {
    emailOrPhone: string;
    password: string;
    rememberMe: boolean;
  }) => {
    setFormError(null);
    try {
      await login({ email: emailOrPhone.trim(), password });
      window.dispatchEvent(new Event('auth-change'));
      setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');
      setTimeout(() => {
        router.push('/user');
      }, 500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      setFormError(msg);
    }
  };

  const handleRegisterSubmit = async ({
    fullName,
    email,
    phone,
    password,
    agreeTerms,
  }: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    agreeTerms: boolean;
  }) => {
    if (!agreeTerms) {
      setFormError('Vui lòng đồng ý với Điều khoản và Chính sách bảo mật.');
      return;
    }
    setFormError(null);
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });
      window.dispatchEvent(new Event('auth-change'));
      setSuccessMsg('Tạo tài khoản thành công! Đang chuyển hướng...');
      setTimeout(() => {
        router.push('/user');
      }, 500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Đăng ký thất bại. Email có thể đã tồn tại.';
      setFormError(msg);
    }
  };

  return (
    <div className="bg-zinc-100 min-h-screen flex items-center justify-center p-0 sm:p-6 lg:p-10 selection:bg-orange-500 selection:text-white font-sans">
      <div className="w-full max-w-6xl min-h-180 bg-white sm:rounded-[2.5rem] shadow-2xl shadow-zinc-300/60 border border-zinc-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative">
        {/* LEFT PANEL: Visual Branding & Lifestyle Showcase */}
        <AuthVisualSide />

        {/* RIGHT PANEL: Authentication Form Area */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-zinc-50/50">
          <AuthHeaderNav />

          <div className="max-w-md w-full mx-auto my-auto py-8 space-y-7">
            {/* Header Title */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900">
                {mode === 'LOGIN' ? 'Chào Mừng Trở Lại' : 'Tạo Tài Khoản Mới'}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 font-medium">
                {mode === 'LOGIN'
                  ? 'Nhập thông tin xác thực để bắt đầu trải nghiệm mua sắm'
                  : 'Đăng ký nhận ngay voucher 50.000đ cho đơn hàng đầu tiên'}
              </p>
            </div>

            {/* Tab Navigation Link Controller */}
            <AuthTabSwitcher activeTab={mode} />

            {/* Social Login Buttons */}
            <AuthSocialButtons />

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-zinc-200" />
              <span className="bg-zinc-50/50 px-3 text-[11px] font-bold text-zinc-400 uppercase tracking-widest absolute">
                Hoặc bằng email
              </span>
            </div>

            {/* Feedback Alerts */}
            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in fade-in duration-200">
                {formError}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form component */}
            {mode === 'LOGIN' ? (
              <LoginForm loading={loading} onSubmit={handleLoginSubmit} />
            ) : (
              <RegisterForm loading={loading} onSubmit={handleRegisterSubmit} />
            )}
          </div>

          <AuthFooter />
        </div>
      </div>
    </div>
  );
}
