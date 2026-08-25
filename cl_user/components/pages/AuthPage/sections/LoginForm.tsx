'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  loading: boolean;
  onSubmit: (credentials: { emailOrPhone: string; password: string; rememberMe: boolean }) => void;
}

export default function LoginForm({ loading, onSubmit }: LoginFormProps) {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ emailOrPhone, password, rememberMe });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 transition-all duration-300">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700">
          Email hoặc Số điện thoại
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={emailOrPhone}
            onChange={(e) => setEmailOrPhone(e.target.value)}
            placeholder="name@example.com"
            className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-zinc-200 rounded-2xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-xs transition-all"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-zinc-700">Mật khẩu</label>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert('Tính năng khôi phục mật khẩu qua Email đang được cập nhật.');
            }}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
          >
            Quên mật khẩu?
          </a>
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-11 pr-11 py-3 text-sm bg-white border border-zinc-200 rounded-2xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-xs transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 text-orange-600 border-zinc-300 rounded focus:ring-orange-500 accent-orange-600 cursor-pointer"
          />
          <label
            htmlFor="remember"
            className="text-xs text-zinc-600 select-none cursor-pointer"
          >
            Ghi nhớ đăng nhập
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-linear-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <span>{loading ? 'Đang đăng nhập...' : 'Đăng Nhập Ngay'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
