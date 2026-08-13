'use client';

import { useState } from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { UserAddress, CreateUserAddressDto } from '@/types/entities/user';

interface CustomerAddressSectionProps {
  userId: string;
  addresses: UserAddress[];
  loadingAddresses: boolean;
  createAddress: (userId: string, dto: CreateUserAddressDto) => Promise<UserAddress>;
  removeAddress: (userId: string, addressId: string) => Promise<void>;
  onRefresh: () => void;
}

export default function CustomerAddressSection({
  userId,
  addresses,
  loadingAddresses,
  createAddress,
  removeAddress,
  onRefresh,
}: CustomerAddressSectionProps) {
  const [showAddAddress, setShowAddAddress] = useState<boolean>(false);

  // Address form fields
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [ward, setWard] = useState('');
  const [district, setDistrict] = useState('');
  const [cityProvince, setCityProvince] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [submittingAddr, setSubmittingAddr] = useState(false);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !phone.trim() || !streetAddress.trim() || !district.trim() || !cityProvince.trim()) {
      alert('Vui lòng nhập đầy đủ thông tin bắt buộc cho địa chỉ.');
      return;
    }

    setSubmittingAddr(true);
    try {
      await createAddress(userId, {
        recipient_name: recipientName.trim(),
        phone: phone.trim(),
        street_address: streetAddress.trim(),
        ward: ward.trim() || undefined,
        district: district.trim(),
        city_province: cityProvince.trim(),
        is_default: isDefault,
      });

      // Reset
      setRecipientName('');
      setPhone('');
      setStreetAddress('');
      setWard('');
      setDistrict('');
      setCityProvince('');
      setIsDefault(false);
      setShowAddAddress(false);

      onRefresh();
    } catch {
      alert('Lỗi khi thêm địa chỉ giao hàng!');
    } finally {
      setSubmittingAddr(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
      try {
        await removeAddress(userId, addressId);
        onRefresh();
      } catch {
        alert('Không thể xóa địa chỉ!');
      }
    }
  };

  return (
    <div className="border-3 border-[#09090B] bg-white p-5 shadow-[4px_4px_0px_0px_#09090B] space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b-2 border-[#09090B] pb-3">
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-[#F97316]" />
          <span className="font-black text-sm uppercase text-[#09090B]">
            Sổ Địa Chỉ Giao Hàng ({addresses.length})
          </span>
        </div>
        <button
          onClick={() => setShowAddAddress(!showAddAddress)}
          className="inline-flex items-center gap-1 px-3 py-1 bg-[#F97316] text-[#09090B] border-2 border-[#09090B] font-extrabold uppercase text-[11px] shadow-[2px_2px_0px_0px_#09090B]"
        >
          <Plus size={14} />
          {showAddAddress ? 'Hủy Thêm' : 'Thêm Địa Chỉ'}
        </button>
      </div>

      {/* Inline Add Address Form */}
      {showAddAddress && (
        <form onSubmit={handleAddAddress} className="p-4 border-2 border-[#09090B] bg-amber-50 space-y-3">
          <h4 className="font-black text-xs uppercase text-[#09090B] border-b border-[#09090B] pb-1">
            Tạo Địa Chỉ Mới
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-[#09090B]">Tên người nhận *</label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-2 py-1.5 border-2 border-[#09090B] bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#09090B]">Số điện thoại *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full px-2 py-1.5 border-2 border-[#09090B] bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#09090B]">Địa chỉ đường/nhà *</label>
            <input
              type="text"
              required
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="123 Đường Nguyễn Trãi"
              className="w-full px-2 py-1.5 border-2 border-[#09090B] bg-white text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-[#09090B]">Phường/Xã</label>
              <input
                type="text"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                placeholder="Phường 2"
                className="w-full px-2 py-1.5 border-2 border-[#09090B] bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#09090B]">Quận/Huyện (cũ) *</label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="Quận 5"
                className="w-full px-2 py-1.5 border-2 border-[#09090B] bg-white text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#09090B]">Tỉnh/TP *</label>
              <input
                type="text"
                required
                value={cityProvince}
                onChange={(e) => setCityProvince(e.target.value)}
                placeholder="TP. Hồ Chí Minh"
                className="w-full px-2 py-1.5 border-2 border-[#09090B] bg-white text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 border-2 border-[#09090B]"
              />
              <span className="text-xs font-bold text-[#09090B]">Đặt làm địa chỉ mặc định</span>
            </label>

            <button
              type="submit"
              disabled={submittingAddr}
              className="px-4 py-1.5 bg-[#09090B] text-white border-2 border-[#09090B] font-bold uppercase text-xs shadow-[2px_2px_0px_0px_#F97316]"
            >
              {submittingAddr ? 'Đang Lưu...' : 'Lưu Địa Chỉ'}
            </button>
          </div>
        </form>
      )}

      {/* Addresses List */}
      {loadingAddresses ? (
        <div className="text-center py-4 text-zinc-500 font-bold">Đang tải sổ địa chỉ...</div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-4 text-zinc-400 font-bold">Khách hàng chưa đăng ký địa chỉ nào.</div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-3 border-2 border-[#09090B] relative flex justify-between items-start ${
                addr.is_default ? 'bg-amber-50 border-amber-500' : 'bg-white'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="text-[#09090B] text-xs">{addr.recipient_name}</strong>
                  <span className="text-zinc-500 text-[11px]">({addr.phone})</span>
                  {addr.is_default && (
                    <span className="px-2 py-0.5 bg-amber-400 border border-[#09090B] text-[9px] font-black uppercase text-[#09090B]">
                      Mặc định
                    </span>
                  )}
                </div>
                <p className="text-zinc-600 text-xs">
                  {addr.street_address}{addr.ward ? `, ${addr.ward}` : ''}, {addr.district}, {addr.city_province}
                </p>
              </div>

              <button
                onClick={() => handleDeleteAddress(addr.id)}
                className="p-1 text-rose-600 hover:bg-rose-100 border border-transparent hover:border-[#09090B]"
                title="Xóa địa chỉ"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
