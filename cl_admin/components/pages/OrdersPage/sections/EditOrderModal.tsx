'use client';

import { useState, useEffect } from 'react';
import { Order, OrderStatus, UpdateOrderDto } from '@/types/entities/order';
import { X } from 'lucide-react';

interface EditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdate: (id: string, payload: UpdateOrderDto) => Promise<void>;
}

export default function EditOrderModal({
  isOpen,
  onClose,
  order,
  onUpdate
}: EditOrderModalProps) {
  const [editStatus, setEditStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [editAddress, setEditAddress] = useState('');
  const [editShippingFee, setEditShippingFee] = useState<number>(0);
  const [editDiscount, setEditDiscount] = useState<number>(0);
  const [editNote, setEditNote] = useState('');
  const [editCancelReason, setEditCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (order && isOpen) {
      const timer = setTimeout(() => {
        setEditStatus(order.status);
        setEditAddress(order.shipping_address);
        setEditShippingFee(order.shipping_fee || 0);
        setEditDiscount(order.discount_amount || 0);
        setEditNote(order.note || '');
        setEditCancelReason(order.cancel_reason || '');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [order, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;

    setSubmitting(true);
    try {
      const payload: UpdateOrderDto = {
        status: editStatus,
        shipping_address: editAddress,
        shipping_fee: editShippingFee,
        discount_amount: editDiscount,
        note: editNote || undefined,
        cancel_reason: editStatus === OrderStatus.CANCELLED ? editCancelReason : undefined
      };

      await onUpdate(order.id, payload);
      onClose();
    } catch {
      alert('Lỗi khi cập nhật đơn hàng!');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-[#09090B]/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-[#09090B] w-full max-w-lg p-6 shadow-[8px_8px_0px_0px_#09090B] relative">
        <button
          onClick={onClose}
          disabled={submitting}
          className="absolute top-4 right-4 p-1.5 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <X size={16} />
        </button>

        <h2 className="text-xl font-extrabold uppercase border-b-2 border-[#09090B] pb-3 mb-6">
          📝 Sửa Thông Tin Đơn Hàng
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Trạng Thái Đơn Hàng</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
              className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm focus:outline-none bg-white cursor-pointer"
            >
              <option value={OrderStatus.PENDING}>PENDING (CHỜ DUYỆT)</option>
              <option value={OrderStatus.PROCESSING}>PROCESSING (ĐANG XỬ LÝ)</option>
              <option value={OrderStatus.SHIPPED}>SHIPPED (ĐÃ GIAO ĐỐI TÁC GIAO NHẬN)</option>
              <option value={OrderStatus.DELIVERED}>DELIVERED (THÀNH CÔNG)</option>
              <option value={OrderStatus.CANCELLED}>CANCELLED (HỦY ĐƠN)</option>
              <option value={OrderStatus.REFUNDED}>REFUNDED (HOÀN TIỀN)</option>
            </select>
          </div>

          {editStatus === OrderStatus.CANCELLED && (
            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1 text-rose-600">Lý do hủy đơn</label>
              <input
                type="text"
                value={editCancelReason}
                onChange={(e) => setEditCancelReason(e.target.value)}
                placeholder="Nhập lý do hủy..."
                className="w-full px-3 py-2 border-2 border-rose-400 font-mono text-sm focus:outline-none focus:border-[#09090B]"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Địa Chỉ Nhận Hàng</label>
            <input
              type="text"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[#09090B] text-sm focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">Phí Vận Chuyển (đ)</label>
              <input
                type="number"
                value={editShippingFee}
                onChange={(e) => setEditShippingFee(Number(e.target.value))}
                className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase mb-1">Giảm Giá (đ)</label>
              <input
                type="number"
                value={editDiscount}
                onChange={(e) => setEditDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 border-2 border-[#09090B] font-mono text-sm focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase mb-1">Ghi Chú Vận Hành</label>
            <textarea
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              className="w-full px-3 py-2 border-2 border-[#09090B] text-sm focus:outline-none h-16 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 border-t-2 border-[#09090B] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border-2 border-[#09090B] bg-white text-[#09090B] font-mono text-xs font-bold uppercase hover:bg-zinc-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border-2 border-[#09090B] bg-[#09090B] text-white font-mono text-xs font-bold uppercase hover:bg-zinc-800"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
