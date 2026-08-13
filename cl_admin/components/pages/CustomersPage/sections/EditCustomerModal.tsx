'use client';

import { useState, useEffect } from 'react';
import { X, Edit3, Shield, User as UserIcon, ShieldAlert } from 'lucide-react';
import { User, UpdateUserDto } from '@/types/entities/user';

interface EditCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate: (id: string, dto: UpdateUserDto) => Promise<void>;
}

export default function EditCustomerModal({
  isOpen,
  onClose,
  user,
  onUpdate,
}: EditCustomerModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'ADMIN' | 'SUPPORT'>('CUSTOMER');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        setFullName(user.full_name || '');
        setEmail(user.email || '');
        setPhone(user.phone || '');
        setRole(user.role || 'CUSTOMER');
        setIsActive(user.is_active ?? true);
        setErrorMsg('');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setErrorMsg('Họ tên và Email không được để trống.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      await onUpdate(user.id, {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        role,
        is_active: isActive,
      });

      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật thông tin người dùng';
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg border-4 border-[#09090B] bg-white shadow-[8px_8px_0px_0px_#09090B]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-[#09090B] bg-amber-400 text-[#09090B]">
          <div className="flex items-center gap-2">
            <Edit3 size={22} />
            <h2 className="font-mono font-black text-lg uppercase tracking-tight">
              Chỉnh Sửa Người Dùng #{user.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 border-2 border-[#09090B] bg-white hover:bg-zinc-100 text-[#09090B]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-mono">
          
          {errorMsg && (
            <div className="p-3 border-2 border-[#09090B] bg-rose-100 text-rose-900 text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-xs font-black uppercase text-[#09090B] mb-1">
              Họ Và Tên <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[#09090B] bg-white font-mono text-xs font-bold focus:outline-none focus:bg-zinc-50 shadow-[2px_2px_0px_0px_#09090B]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-black uppercase text-[#09090B] mb-1">
              Địa Chỉ Email <span className="text-rose-600">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[#09090B] bg-white font-mono text-xs font-bold focus:outline-none focus:bg-zinc-50 shadow-[2px_2px_0px_0px_#09090B]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-black uppercase text-[#09090B] mb-1">
              Số Điện Thoại
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912345678"
              className="w-full px-3 py-2 border-2 border-[#09090B] bg-white font-mono text-xs font-bold focus:outline-none focus:bg-zinc-50 shadow-[2px_2px_0px_0px_#09090B]"
            />
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-black uppercase text-[#09090B] mb-1">
              Vai Trò Người Dùng
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRole('CUSTOMER')}
                className={`flex items-center justify-center gap-1.5 p-2.5 border-2 border-[#09090B] text-xs font-bold uppercase transition-all ${
                  role === 'CUSTOMER'
                    ? 'bg-[#09090B] text-white shadow-[2px_2px_0px_0px_#F97316]'
                    : 'bg-white text-[#09090B] hover:bg-zinc-50'
                }`}
              >
                <UserIcon size={14} />
                CUSTOMER
              </button>

              <button
                type="button"
                onClick={() => setRole('SUPPORT')}
                className={`flex items-center justify-center gap-1.5 p-2.5 border-2 border-[#09090B] text-xs font-bold uppercase transition-all ${
                  role === 'SUPPORT'
                    ? 'bg-blue-600 text-white shadow-[2px_2px_0px_0px_#09090B]'
                    : 'bg-white text-[#09090B] hover:bg-zinc-50'
                }`}
              >
                <Shield size={14} />
                SUPPORT
              </button>

              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`flex items-center justify-center gap-1.5 p-2.5 border-2 border-[#09090B] text-xs font-bold uppercase transition-all ${
                  role === 'ADMIN'
                    ? 'bg-purple-600 text-white shadow-[2px_2px_0px_0px_#09090B]'
                    : 'bg-white text-[#09090B] hover:bg-zinc-50'
                }`}
              >
                <ShieldAlert size={14} />
                ADMIN
              </button>
            </div>
          </div>

          {/* Active Status Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 border-2 border-[#09090B] text-[#F97316] focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-bold text-[#09090B]">Trạng thái tài khoản: Hoạt động</span>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-[#09090B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border-2 border-[#09090B] bg-white text-[#09090B] text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#09090B]"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 border-2 border-[#09090B] bg-amber-400 text-[#09090B] text-xs font-black uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
            >
              {submitting ? 'Đang Luyện...' : 'Lưu Thay Đổi'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
