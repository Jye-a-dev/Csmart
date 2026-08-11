'use client';

import { useState, useEffect } from 'react';
import { CreateOrderDto, CreateOrderItemDto, OrderStatus } from '@/types/entities/order';
import { User } from '@/types/entities/user';
import { X, Trash2 } from 'lucide-react';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onCreate: (payload: CreateOrderDto) => Promise<void>;
  formatUserUuid: (user: User) => string;
}

export default function CreateOrderModal({
  isOpen,
  onClose,
  users,
  onCreate,
  formatUserUuid
}: CreateOrderModalProps) {
  const [newOrderCode, setNewOrderCode] = useState('');
  const [newUserId, setNewUserId] = useState<number | undefined>(undefined);
  const [newAddress, setNewAddress] = useState('');
  const [newShippingFee, setNewShippingFee] = useState<number>(0);
  const [newDiscount, setNewDiscount] = useState<number>(0);
  const [newNote, setNewNote] = useState('');
  const [newItems, setNewItems] = useState<CreateOrderItemDto[]>([
    { product_name: '', unit_price: 0, quantity: 1 }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setNewOrderCode('');
    setNewUserId(undefined);
    setNewAddress('');
    setNewShippingFee(0);
    setNewDiscount(0);
    setNewNote('');
    setNewItems([{ product_name: '', unit_price: 0, quantity: 1 }]);
  };

  // Generate UUID v4 order code
  const handleGenerateCode = () => {
    const uuid = typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === 'x' ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
    setNewOrderCode(`ORD-${uuid.toUpperCase()}`);
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        resetForm();
        handleGenerateCode();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleAddCreateItem = () => {
    setNewItems([...newItems, { product_name: '', unit_price: 0, quantity: 1 }]);
  };

  const handleRemoveCreateItem = (index: number) => {
    if (newItems.length > 1) {
      setNewItems(newItems.filter((_, i) => i !== index));
    }
  };

  const handleUpdateCreateItem = (index: number, key: keyof CreateOrderItemDto, value: string | number) => {
    const updated = [...newItems];
    updated[index] = { ...updated[index], [key]: value };
    setNewItems(updated);
  };

  const calculateTotalAmount = () => {
    const itemsTotal = newItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    return Math.max(0, itemsTotal + newShippingFee - newDiscount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderCode || !newAddress || newItems.some(item => !item.product_name || item.unit_price <= 0)) {
      alert('Vui lòng điền đầy đủ thông tin mã đơn hàng, địa chỉ và thông tin sản phẩm hợp lệ!');
      return;
    }

    setSubmitting(true);
    try {
      const total_amount = calculateTotalAmount();
      const payload: CreateOrderDto = {
        order_code: newOrderCode,
        user_id: newUserId || undefined,
        status: OrderStatus.PENDING,
        total_amount,
        shipping_fee: newShippingFee,
        discount_amount: newDiscount,
        shipping_address: newAddress,
        note: newNote || undefined,
        items: newItems
      };

      await onCreate(payload);
      onClose();
    } catch {
      alert('Lỗi khi tạo đơn hàng. Vui lòng kiểm tra lại!');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#09090B]/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white border-4 border-[#09090B] w-full max-w-2xl p-6 shadow-[8px_8px_0px_0px_#09090B] max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-1.5 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <X size={16} />
        </button>

        <div className="border-b-2 border-[#09090B] pb-3 mb-6">
          <h2 className="text-xl font-extrabold uppercase">
            ➕ Tạo Đơn Hàng Mới
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase">MÃ ĐƠN HÀNG TỰ ĐỘNG:</span>
            <span className="font-mono text-xs font-black bg-zinc-100 border-2 border-[#09090B] px-2 py-0.5 shadow-[1.5px_1.5px_0px_0px_#09090B]">
              {newOrderCode}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Khách Hàng (Tùy chọn)</label>
            <select
              value={newUserId || ''}
              onChange={(e) => {
                const val = e.target.value;
                setNewUserId(val ? Number(val) : undefined);
              }}
              className="w-full px-3 py-2.5 border-2 border-[#09090B] font-mono text-xs font-bold focus:outline-none bg-white cursor-pointer shadow-[2px_2px_0px_0px_#09090B]"
            >
              <option value="">-- Chọn Khách Hàng --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({formatUserUuid(u)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Địa Chỉ Nhận Hàng *</label>
            <input
              type="text"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Số nhà, Tên đường, Quận/Huyện (cũ), Thành phố..."
              className="w-full px-3 py-2 border-2 border-[#09090B] text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">Phí Vận Chuyển (đ)</label>
              <input
                type="number"
                value={newShippingFee || ''}
                onChange={(e) => setNewShippingFee(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">Giảm Giá (đ)</label>
              <input
                type="number"
                value={newDiscount || ''}
                onChange={(e) => setNewDiscount(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm focus:outline-none shadow-[2px_2px_0px_0px_#09090B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Ghi Chú Đơn Hàng</label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Khách giao tối muộn, hàng dễ vỡ..."
              className="w-full px-3 py-2 border-2 border-[#09090B] text-sm focus:outline-none h-14 resize-none shadow-[2px_2px_0px_0px_#09090B]"
            />
          </div>

          {/* Items Section */}
          <div className="border-2 border-[#09090B] p-4 bg-zinc-50 space-y-4 shadow-[3px_3px_0px_0px_#09090B]">
            <div className="flex items-center justify-between border-b-2 border-zinc-200 pb-2">
              <h3 className="text-xs font-mono font-bold uppercase text-zinc-700">Sản phẩm trong đơn hàng</h3>
              <button
                type="button"
                onClick={handleAddCreateItem}
                className="px-2.5 py-1 border border-[#09090B] bg-white hover:bg-zinc-100 text-xs font-mono font-bold flex items-center gap-1 shadow-[1px_1px_0px_0px_#09090B]"
              >
                + Thêm dòng
              </button>
            </div>

            {newItems.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-3 items-end border-b border-dashed border-zinc-300 pb-3 last:border-0 last:pb-0">
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-0.5">Tên Sản Phẩm *</label>
                  <input
                    type="text"
                    value={item.product_name}
                    onChange={(e) => handleUpdateCreateItem(index, 'product_name', e.target.value)}
                    placeholder="Vd: Quần Jean bò tăm"
                    className="w-full px-2.5 py-1.5 border-2 border-[#09090B] text-xs focus:outline-none bg-white"
                    required
                  />
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-0.5">Đơn Giá *</label>
                  <input
                    type="number"
                    value={item.unit_price || ''}
                    onChange={(e) => handleUpdateCreateItem(index, 'unit_price', Number(e.target.value))}
                    placeholder="120000"
                    className="w-full px-2.5 py-1.5 border-2 border-[#09090B] font-mono text-xs focus:outline-none bg-white"
                    required
                  />
                </div>
                <div className="w-full md:w-20">
                  <label className="block text-[10px] font-mono font-bold uppercase text-zinc-500 mb-0.5">SL *</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateCreateItem(index, 'quantity', Number(e.target.value))}
                    min="1"
                    className="w-full px-2.5 py-1.5 border-2 border-[#09090B] font-mono text-xs focus:outline-none bg-white"
                    required
                  />
                </div>
                {newItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCreateItem(index)}
                    className="p-2 border-2 border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}

            <div className="text-right font-mono text-sm font-bold border-t border-zinc-200 pt-2 text-[#09090B]">
              Tổng tạm tính (sau cộng phí, trừ discount):{' '}
              <span className="text-[#F97316]">
                {calculateTotalAmount().toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t-2 border-[#09090B] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 border-2 border-[#09090B] bg-white text-[#09090B] font-mono text-sm font-bold uppercase hover:bg-zinc-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 border-2 border-[#09090B] bg-[#09090B] text-white font-mono text-sm font-bold uppercase hover:bg-zinc-800"
            >
              Tạo đơn hàng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
