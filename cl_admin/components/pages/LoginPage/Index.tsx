'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import {
  LoginPageHeader,
  LoginForm,
  LoginPageFeatures,
  LoginPageFooter
} from './sections';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, isAuthenticated, getCurrentUser } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Redirect to dashboard/home if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      const user = getCurrentUser();
      if (user?.role === 'ADMIN') {
        router.replace('/dashboard');
      } else {
        router.replace('/');
      }
    }
  }, [isAuthenticated, getCurrentUser, router]);

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
      <LoginPageHeader />
      
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch w-full">
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            errorMsg={errorMsg}
            loading={loading}
            onSubmit={handleSubmit}
          />
          <LoginPageFeatures />
        </div>
      </main>

      <LoginPageFooter />
    </div>
  );
}
