'use client';

import { useState } from 'react';
import { User as UserIcon, Mail, Phone, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface RegisterFormProps {
  loading: boolean;
  onSubmit: (data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    agreeTerms: boolean;
  }) => void;
}

export default function RegisterForm({ loading, onSubmit }: RegisterFormProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      fullName,
      email,
      phone,
      password,
      agreeTerms,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 transition-all duration-300">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700">Họ và tên</label>
        <div className="relative">
          <UserIcon className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nguyễn Văn A"
            className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-zinc-200 rounded-2xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-xs transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700">Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              className="w-full pl-11 pr-3 py-3 text-sm bg-white border border-zinc-200 rounded-2xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-xs transition-all"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-700">Số điện thoại</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
              className="w-full pl-11 pr-3 py-3 text-sm bg-white border border-zinc-200 rounded-2xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-xs transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-zinc-700">Mật khẩu</label>
        <div className="relative">
          <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Tối thiểu 8 ký tự"
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

      <div className="flex items-start gap-2.5 pt-1">
        <input
          type="checkbox"
          id="terms"
          required
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="w-4 h-4 mt-0.5 text-orange-600 border-zinc-300 rounded focus:ring-orange-500 accent-orange-600 cursor-pointer"
        />
        <label
          htmlFor="terms"
          className="text-xs text-zinc-500 select-none leading-relaxed cursor-pointer"
        >
          Tôi đồng ý với{' '}
          <a href="#" className="text-orange-600 font-semibold hover:underline">
            Điều khoản
          </a>{' '}
          và{' '}
          <a href="#" className="text-orange-600 font-semibold hover:underline">
            Chính sách bảo mật
          </a>
          .
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-linear-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 active:scale-[0.99] text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        <span>{loading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản Mới'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}
