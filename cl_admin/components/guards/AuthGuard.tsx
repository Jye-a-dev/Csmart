'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks';
import { Loader2, ShieldAlert, LogOut, Home } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, getCurrentUser, logout } = useAuth();
  const [checking, setChecking] = useState<boolean>(true);
  const [authorized, setAuthorized] = useState<boolean>(false);

  useEffect(() => {
    const verifyAuth = () => {
      if (!isAuthenticated()) {
        router.push('/login');
        return;
      }

      const user = getCurrentUser();
      if (!user || user.role !== 'ADMIN') {
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
      setChecking(false);
    };

    verifyAuth();
  }, [isAuthenticated, getCurrentUser, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // 1. Loading Screen (Màn hình đang tải thông tin xác thực)
  if (checking) {
    return (
      <div className="fixed inset-0 bg-[#f6f4ef] flex flex-col items-center justify-center z-50 p-6">
        <div className="border-4 border-[#09090B] bg-[#FAFAFA] p-8 shadow-[8px_8px_0px_0px_#09090B] flex flex-col items-center text-center max-w-sm w-full">
          <Loader2 className="h-12 w-12 text-[#F97316] animate-spin mb-4" />
          <h3 className="font-mono font-bold text-lg text-[#09090B] uppercase tracking-wider mb-2">
            Đang Xác Thực...
          </h3>
          <p className="text-zinc-600 text-xs font-mono">
            Vui lòng đợi trong giây lát khi hệ thống kiểm tra quyền hạn truy cập của tài khoản.
          </p>
        </div>
      </div>
    );
  }

  // 2. Forbidden Screen (Màn hình thông báo lỗi không có quyền truy cập)
  if (!authorized) {
    return (
      <div className="fixed inset-0 bg-[#f6f4ef] flex flex-col items-center justify-center z-50 p-6">
        <div className="border-4 border-[#09090B] bg-[#FAFAFA] p-8 shadow-[8px_8px_0px_0px_#09090B] flex flex-col items-center text-center max-w-md w-full">
          <div className="p-4 border-2 border-[#09090B] bg-rose-100 text-rose-600 rounded-full mb-6">
            <ShieldAlert size={40} />
          </div>

          <h2 className="text-2xl font-extrabold text-[#09090B] tracking-tight uppercase mb-3">
            Không Có Quyền Truy Cập
          </h2>

          <p className="text-sm text-zinc-600 leading-relaxed mb-6">
            Tài khoản của bạn không được cấp quyền quản trị viên (<strong className="text-[#09090B]">ADMIN</strong>) để truy cập không gian làm việc này. Vui lòng đăng nhập lại bằng tài khoản được phân quyền phù hợp.
          </p>

          <div className="w-full flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLogout}
              className="btn-brutal flex-1 inline-flex items-center justify-center gap-2 bg-[#F97316] text-[#09090B] font-mono font-bold px-4 py-3 uppercase text-xs cursor-pointer border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <LogOut size={16} />
              Đăng Nhập Lại
            </button>
            <button
              onClick={() => router.push('/')}
              className="btn-brutal flex-1 inline-flex items-center justify-center gap-2 bg-[#FAFAFA] text-[#09090B] font-mono font-bold px-4 py-3 uppercase text-xs cursor-pointer border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all hover:bg-zinc-100"
            >
              <Home size={16} />
              Trang Chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Render children if authorized admin
  return <>{children}</>;
}
