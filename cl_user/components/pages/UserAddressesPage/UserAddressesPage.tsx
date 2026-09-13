'use client';

import React, { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { MapPin, Plus, CheckCircle2, Home } from 'lucide-react';
import { useUsers } from '@/hooks';
import type { User, UserAddress, CreateUserAddressDto } from '@/types/entities/user';
import {
  AddressCard,
  AddressFormModal,
  DeleteAddressModal,
  AddressEmptyState,
} from './sections';

let _cachedRaw: string | null = null;
let _cachedUser: User | null = null;

function getUserSnapshot(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (raw === _cachedRaw) return _cachedUser;
  _cachedRaw = raw;
  if (!raw) {
    _cachedUser = null;
    return null;
  }
  try {
    _cachedUser = JSON.parse(raw) as User;
  } catch {
    _cachedUser = null;
  }
  return _cachedUser;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('auth-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('auth-change', callback);
  };
}

const DEFAULT_ADDRESSES: UserAddress[] = [
  {
    id: 'addr-default-1',
    user_id: 'guest',
    recipient_name: 'Nguyễn Văn An',
    phone: '0901234567',
    street_address: '123 Đường Nguyễn Huệ, Phường Bến Nghé',
    ward: 'Phường Bến Nghé',
    district: 'Quận 1',
    city_province: 'TP. Hồ Chí Minh',
    is_default: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'addr-default-2',
    user_id: 'guest',
    recipient_name: 'Nguyễn Văn An (Văn Phòng)',
    phone: '0987654321',
    street_address: 'Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22',
    ward: 'Phường 22',
    district: 'Quận Bình Thạnh',
    city_province: 'TP. Hồ Chí Minh',
    is_default: false,
    created_at: new Date().toISOString(),
  },
];

export default function UserAddressesPage() {
  const user = useSyncExternalStore(subscribe, getUserSnapshot, () => null);
  const { findAddresses, createAddress, updateAddress, removeAddress, loading } = useUsers();

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<UserAddress | null>(null);
  const [deleteModalAddress, setDeleteModalAddress] = useState<UserAddress | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const loadAddresses = useCallback(async () => {
    if (!user?.id) {
      const local = typeof window !== 'undefined' ? localStorage.getItem('user_local_addresses') : null;
      if (local) {
        try {
          setAddresses(JSON.parse(local));
          return;
        } catch {
          // ignore
        }
      }
      setAddresses(DEFAULT_ADDRESSES);
      return;
    }

    try {
      const data = await findAddresses(user.id);
      setAddresses(data && data.length > 0 ? data : []);
    } catch (err) {
      console.error('Failed to load user addresses:', err);
      setAddresses(DEFAULT_ADDRESSES);
    }
  }, [findAddresses, user]);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      await Promise.resolve();
      if (!isMounted) return;
      if (!user?.id) {
        const local = typeof window !== 'undefined' ? localStorage.getItem('user_local_addresses') : null;
        if (local) {
          try {
            if (isMounted) setAddresses(JSON.parse(local));
            return;
          } catch {
            // ignore
          }
        }
        if (isMounted) setAddresses(DEFAULT_ADDRESSES);
        return;
      }

      try {
        const data = await findAddresses(user.id);
        if (isMounted) {
          setAddresses(data && data.length > 0 ? data : []);
        }
      } catch (err) {
        console.error('Failed to load user addresses:', err);
        if (isMounted) setAddresses(DEFAULT_ADDRESSES);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [findAddresses, user]);

  const openCreateModal = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const openEditModal = (addr: UserAddress) => {
    setEditingAddress(addr);
    setModalOpen(true);
  };

  const handleSubmit = async (dto: CreateUserAddressDto) => {
    setSubmitting(true);
    try {
      if (user?.id) {
        if (editingAddress) {
          await updateAddress(user.id, editingAddress.id, dto);
          showToast('Cập nhật địa chỉ thành công!');
        } else {
          await createAddress(user.id, dto);
          showToast('Thêm địa chỉ mới thành công!');
        }
        await loadAddresses();
      } else {
        let updated: UserAddress[];
        if (editingAddress) {
          updated = addresses.map((a) => {
            if (a.id === editingAddress.id) {
              return { ...a, ...dto, is_default: dto.is_default ?? false };
            }
            return dto.is_default ? { ...a, is_default: false } : a;
          });
        } else {
          const newAddr: UserAddress = {
            id: `addr-${Date.now()}`,
            user_id: 'guest',
            ...dto,
            is_default: dto.is_default ?? false,
            created_at: new Date().toISOString(),
          };
          updated = dto.is_default
            ? [...addresses.map((a) => ({ ...a, is_default: false })), newAddr]
            : [...addresses, newAddr];
        }
        setAddresses(updated);
        localStorage.setItem('user_local_addresses', JSON.stringify(updated));
        showToast(editingAddress ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ mới thành công!');
      }
      setModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thao tác không thành công.';
      showToast(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (addr: UserAddress) => {
    try {
      if (user?.id) {
        await updateAddress(user.id, addr.id, { is_default: true });
        await loadAddresses();
      } else {
        const updated = addresses.map((a) => ({
          ...a,
          is_default: a.id === addr.id,
        }));
        setAddresses(updated);
        localStorage.setItem('user_local_addresses', JSON.stringify(updated));
      }
      showToast(`Đã đặt "${addr.recipient_name}" làm địa chỉ mặc định.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật mặc định.';
      showToast(msg);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalAddress) return;
    try {
      if (user?.id) {
        await removeAddress(user.id, deleteModalAddress.id);
        await loadAddresses();
      } else {
        const updated = addresses.filter((a) => a.id !== deleteModalAddress.id);
        setAddresses(updated);
        localStorage.setItem('user_local_addresses', JSON.stringify(updated));
      }
      showToast('Đã xóa địa chỉ thành công.');
      setDeleteModalAddress(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa địa chỉ này.';
      showToast(msg);
    }
  };

  return (
    <div className="min-w-0 flex-1 space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-linear-to-r from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
            <MapPin size={14} /> Sổ Địa Chỉ
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Sổ Địa Chỉ Nhận Hàng</h1>
          <p className="mt-2 text-sm text-orange-100/90 leading-relaxed">
            Quản lý địa chỉ giao hàng của bạn để thanh toán nhanh chóng hơn khi mua sắm tại CSmart.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="relative z-10 inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-orange-600 font-extrabold text-xs shadow-md hover:bg-orange-50 transition-colors cursor-pointer"
        >
          <Plus size={16} />
          <span>Thêm Địa Chỉ Mới</span>
        </button>
        <div className="absolute -right-5 -bottom-5 opacity-10 pointer-events-none">
          <Home size={220} />
        </div>
      </div>

      {/* Address List */}
      <div className="space-y-4">
        {loading && addresses.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200">
            <div className="w-10 h-10 border-3 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-500">Đang tải danh sách địa chỉ...</p>
          </div>
        ) : addresses.length === 0 ? (
          <AddressEmptyState onAddFirst={openCreateModal} />
        ) : (
          addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onSetDefault={handleSetDefault}
              onEdit={openEditModal}
              onDelete={(target) => setDeleteModalAddress(target)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <AddressFormModal
        isOpen={modalOpen}
        editingAddress={editingAddress}
        defaultRecipientName={user?.full_name || ''}
        defaultPhone={user?.phone || ''}
        submitting={submitting}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <DeleteAddressModal
        address={deleteModalAddress}
        onClose={() => setDeleteModalAddress(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
