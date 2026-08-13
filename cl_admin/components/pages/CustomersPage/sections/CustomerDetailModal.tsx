'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle2, XCircle, Mail, Phone, Calendar, Clock, UserCheck } from 'lucide-react';
import { User, UserAddress, CreateUserAddressDto } from '@/types/entities/user';
import CustomerAddressSection from './CustomerAddressSection';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  findAddresses: (userId: string) => Promise<UserAddress[]>;
  createAddress: (userId: string, dto: CreateUserAddressDto) => Promise<UserAddress>;
  removeAddress: (userId: string, addressId: string) => Promise<void>;
  onOpenEdit: (user: User) => void;
}

export default function CustomerDetailModal({
  isOpen,
  onClose,
  user,
  findAddresses,
  createAddress,
  removeAddress,
  onOpenEdit,
}: CustomerDetailModalProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(false);

  const loadCustomerAddresses = useCallback(async () => {
    if (!user) return;
    setLoadingAddresses(true);
    try {
      const data = await findAddresses(user.id);
      setAddresses(data || []);
    } catch {
      console.error('Failed to load user addresses');
    } finally {
      setLoadingAddresses(false);
    }
  }, [user, findAddresses]);

  const userId = user?.id;

  useEffect(() => {
    if (!userId || !isOpen) return;

    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        void loadCustomerAddresses();
      }
    }, 0);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [userId, isOpen, loadCustomerAddresses]);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col border-4 border-[#09090B] bg-white shadow-[10px_10px_0px_0px_#09090B] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-[#09090B] bg-[#09090B] text-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 border-2 border-white bg-[#F97316] text-[#09090B] font-mono font-black flex items-center justify-center text-base shadow-[2px_2px_0px_0px_#FAFAFA]">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-mono font-black text-lg uppercase tracking-tight text-white">
                {user.full_name}
              </h2>
              <span className="font-mono text-[10px] text-[#F97316] uppercase font-bold">
                UUID: {String(user.uuid || user.id || '')}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 border-2 border-white bg-white text-[#09090B] hover:bg-zinc-200 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs">
          
          {/* Main User Meta Card */}
          <div className="border-3 border-[#09090B] bg-[#FAFAFA] p-5 shadow-[4px_4px_0px_0px_#09090B] space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#09090B] pb-3">
              <span className="font-black text-sm uppercase text-[#09090B]">Thông Tin Cá Nhân</span>
              <button
                onClick={() => {
                  onClose();
                  onOpenEdit(user);
                }}
                className="px-3 py-1 bg-amber-400 border-2 border-[#09090B] font-bold uppercase text-[11px] text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
              >
                Chỉnh Sửa
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#F97316]" />
                <span className="text-zinc-500 font-bold">Email:</span>
                <span className="font-black text-[#09090B]">{user.email}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={16} className="text-[#F97316]" />
                <span className="text-zinc-500 font-bold">SĐT:</span>
                <span className="font-black text-[#09090B]">{user.phone || 'Chưa có'}</span>
              </div>

              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-[#F97316]" />
                <span className="text-zinc-500 font-bold">Vai Trò:</span>
                <span className="font-black uppercase text-[#09090B]">{user.role}</span>
              </div>

              <div className="flex items-center gap-2">
                {user.is_active ? (
                  <CheckCircle2 size={16} className="text-emerald-600" />
                ) : (
                  <XCircle size={16} className="text-rose-600" />
                )}
                <span className="text-zinc-500 font-bold">Trạng Thái:</span>
                <span className={`font-black uppercase ${user.is_active ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {user.is_active ? 'Đang Hoạt Động' : 'Vô Hiệu Hóa'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-zinc-400" />
                <span className="text-zinc-500 font-bold">Ngày Đăng Ký:</span>
                <span className="font-bold text-[#09090B]">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} className="text-zinc-400" />
                <span className="text-zinc-500 font-bold">Đăng Nhập Cuối:</span>
                <span className="font-bold text-[#09090B]">
                  {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString('vi-VN') : 'Chưa đăng nhập'}
                </span>
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <CustomerAddressSection
            userId={user.id}
            addresses={addresses}
            loadingAddresses={loadingAddresses}
            createAddress={createAddress}
            removeAddress={removeAddress}
            onRefresh={loadCustomerAddresses}
          />

        </div>

      </div>
    </div>
  );
}
