'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { UserAddress, CreateUserAddressDto } from '@/types/entities/user';

interface AddressFormModalProps {
  isOpen: boolean;
  editingAddress: UserAddress | null;
  defaultRecipientName?: string;
  defaultPhone?: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateUserAddressDto) => void;
}

interface AddressFormContentProps {
  editingAddress: UserAddress | null;
  defaultRecipientName: string;
  defaultPhone: string;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateUserAddressDto) => void;
}

function AddressFormContent({
  editingAddress,
  defaultRecipientName,
  defaultPhone,
  submitting,
  onClose,
  onSubmit,
}: AddressFormContentProps) {
  const [recipientName, setRecipientName] = useState(
    editingAddress?.recipient_name ?? defaultRecipientName
  );
  const [phone, setPhone] = useState(
    editingAddress?.phone ?? defaultPhone
  );
  const [cityProvince, setCityProvince] = useState(
    editingAddress?.city_province ?? 'TP. Hồ Chí Minh'
  );
  const [district, setDistrict] = useState(
    editingAddress?.district ?? ''
  );
  const [ward, setWard] = useState(
    editingAddress?.ward ?? ''
  );
  const [streetAddress, setStreetAddress] = useState(
    editingAddress?.street_address ?? ''
  );
  const [isDefault, setIsDefault] = useState(
    editingAddress?.is_default ?? false
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      recipient_name: recipientName.trim(),
      phone: phone.trim(),
      street_address: streetAddress.trim(),
      ward: ward.trim() || undefined,
      district: district.trim(),
      city_province: cityProvince.trim(),
      is_default: isDefault,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="text-base font-black text-zinc-900">
            {editingAddress ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Mới'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Họ và tên người nhận *
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Số điện thoại liên hệ *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0901234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Tỉnh / Thành phố *
              </label>
              <input
                type="text"
                required
                value={cityProvince}
                onChange={(e) => setCityProvince(e.target.value)}
                placeholder="VD: TP. Hồ Chí Minh"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">
                Quận / Huyện *
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="VD: Quận 1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-zinc-700 block mb-1">Phường / Xã</label>
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="VD: Bến Nghé"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-700 block mb-1">
              Địa chỉ chi tiết (Số nhà, tên đường, tòa nhà) *
            </label>
            <textarea
              required
              rows={2}
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="VD: Số 123 đường Nguyễn Huệ..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:border-orange-500"
            />
          </div>

          <label className="flex items-center gap-2.5 p-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded accent-orange-600 cursor-pointer"
            />
            <span className="text-xs font-semibold text-zinc-700">
              Đặt làm địa chỉ nhận hàng mặc định
            </span>
          </label>

          <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {submitting ? 'Đang lưu...' : editingAddress ? 'Cập Nhật' : 'Thêm Địa Chỉ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AddressFormModal({
  isOpen,
  editingAddress,
  defaultRecipientName = '',
  defaultPhone = '',
  submitting,
  onClose,
  onSubmit,
}: AddressFormModalProps) {
  if (!isOpen) return null;

  return (
    <AddressFormContent
      key={editingAddress ? editingAddress.id : 'new-address'}
      editingAddress={editingAddress}
      defaultRecipientName={defaultRecipientName}
      defaultPhone={defaultPhone}
      submitting={submitting}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

