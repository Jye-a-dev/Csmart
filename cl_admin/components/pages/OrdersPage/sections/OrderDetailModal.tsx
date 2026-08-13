'use client';

import { Order, OrderStatus, OrderItem } from '@/types/entities/order';
import { User } from '@/types/entities/user';
import { X, MapPin, Calendar, Edit } from 'lucide-react';

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  users: User[];
  formatUserUuid: (user: User) => string;
  onQuickStatusUpdate: (id: string, status: OrderStatus) => Promise<void>;
  onOpenEdit: (order: Order) => void;
}

export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
  users,
  formatUserUuid,
  onQuickStatusUpdate,
  onOpenEdit
}: OrderDetailModalProps) {
  
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case OrderStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case OrderStatus.SHIPPED:
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case OrderStatus.DELIVERED:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case OrderStatus.CANCELLED:
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case OrderStatus.REFUNDED:
        return 'bg-zinc-100 text-zinc-800 border-zinc-300';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-200';
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-[#09090B]/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-[#09090B] w-full max-w-2xl p-6 shadow-[8px_8px_0px_0px_#09090B] max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
        >
          <X size={16} />
        </button>

        <div className="border-b-4 border-[#09090B] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-2xl text-[#09090B]">
              {order.order_code}
            </span>
            <span className={`font-mono text-xs font-bold px-2 py-0.5 border-2 border-[#09090B] shadow-[1px_1px_0px_0px_#09090B] uppercase ${getStatusStyle(order.status)}`}>
              {order.status}
            </span>
          </div>
          <p className="text-zinc-400 font-mono text-[10px] mt-1 flex flex-wrap gap-x-2 items-center">
            <span>ID Đơn Hàng: #{order.id}</span>
            <span>•</span>
            <span>Ngày tạo: {new Date(order.created_at).toLocaleString('vi-VN')}</span>
            {(() => {
              const orderUser = users.find((u) => u.id === order.user_id);
              return orderUser ? (
                <>
                  <span>•</span>
                  <span>Khách hàng: <strong className="font-sans text-zinc-600">{orderUser.full_name}</strong> ({formatUserUuid(orderUser)})</span>
                </>
              ) : null;
            })()}
          </p>
        </div>

        {/* Quick Status Workflow Action Buttons */}
        <div className="mb-6 p-4 border-2 border-[#09090B] bg-zinc-50">
          <h4 className="text-xs font-mono font-black uppercase text-zinc-500 mb-2">Thay đổi trạng thái nhanh</h4>
          <div className="flex flex-wrap gap-2">
            {order.status === OrderStatus.PENDING && (
              <button
                onClick={() => onQuickStatusUpdate(order.id, OrderStatus.PROCESSING)}
                className="px-3 py-1.5 border-2 border-[#09090B] bg-blue-100 hover:bg-blue-200 text-blue-900 font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                ⚙️ Bắt đầu Xử lý (Process)
              </button>
            )}
            {(order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING) && (
              <button
                onClick={() => onQuickStatusUpdate(order.id, OrderStatus.SHIPPED)}
                className="px-3 py-1.5 border-2 border-[#09090B] bg-purple-100 hover:bg-purple-200 text-purple-900 font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                🚚 Giao cho Ship (Shipped)
              </button>
            )}
            {order.status === OrderStatus.SHIPPED && (
              <button
                onClick={() => onQuickStatusUpdate(order.id, OrderStatus.DELIVERED)}
                className="px-3 py-1.5 border-2 border-[#09090B] bg-emerald-100 hover:bg-emerald-200 text-emerald-950 font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                ✅ Hoàn thành (Delivered)
              </button>
            )}
            {order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.DELIVERED && (
              <button
                onClick={() => {
                  onClose();
                  onOpenEdit(order);
                }}
                className="px-3 py-1.5 border-2 border-[#09090B] bg-rose-100 hover:bg-rose-200 text-rose-950 font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
              >
                ❌ Hủy đơn hàng (Cancel)
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Address info */}
          <div className="border-2 border-[#09090B] p-4 bg-white shadow-[3px_3px_0px_0px_#09090B] space-y-3">
            <h4 className="font-mono text-xs font-extrabold uppercase text-[#09090B] border-b border-zinc-200 pb-1.5 flex items-center gap-1.5">
              <MapPin size={14} className="text-[#F97316]" /> Thông Tin Giao Nhận
            </h4>
            <div className="text-xs space-y-2">
              <p className="leading-relaxed">
                <strong className="text-zinc-500 font-mono block">ĐỊA CHỈ NHẬN HÀNG:</strong>
                {order.shipping_address}
              </p>
              <p>
                <strong className="text-zinc-500 font-mono block">GHI CHÚ VẬN HÀNH:</strong>
                {order.note || <span className="italic text-zinc-400">Không có ghi chú</span>}
              </p>
              {order.cancel_reason && (
                <p className="p-2 bg-rose-50 border border-rose-200 text-rose-700">
                  <strong className="font-mono block">LÝ DO HỦY ĐƠN:</strong>
                  {order.cancel_reason}
                </p>
              )}
            </div>
          </div>

          {/* Financial Calculation summary */}
          <div className="border-2 border-[#09090B] p-4 bg-white shadow-[3px_3px_0px_0px_#09090B] space-y-3">
            <h4 className="font-mono text-xs font-extrabold uppercase text-[#09090B] border-b border-zinc-200 pb-1.5 flex items-center gap-1.5">
              <Calendar size={14} className="text-[#F97316]" /> Hạch toán Đơn Hàng
            </h4>
            <div className="text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Giá trị sản phẩm:</span>
                <span className="font-bold text-[#09090B]">
                  {((order.items || []).reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)).toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Phí giao hàng:</span>
                <span className="text-zinc-700">+{Number(order.shipping_fee || 0).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Mã giảm giá (discount):</span>
                <span className="text-rose-600">-{Number(order.discount_amount || 0).toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-zinc-300 pt-2 font-bold text-sm">
                <span className="text-[#09090B]">TỔNG THANH TOÁN:</span>
                <span className="text-[#F97316]">{Number(order.total_amount).toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="border-2 border-[#09090B] p-4 bg-zinc-50">
          <h4 className="text-xs font-mono font-extrabold uppercase text-[#09090B] border-b border-zinc-300 pb-2 mb-3">
            Danh sách chi tiết sản phẩm ({order.items?.length || 0})
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#09090B] text-zinc-500 uppercase font-mono">
                  <th className="py-2 pr-2">Tên Sản Phẩm</th>
                  <th className="py-2 px-2 text-right">Đơn Giá</th>
                  <th className="py-2 px-2 text-center">SL</th>
                  <th className="py-2 pl-2 text-right">Thành Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {!order.items || order.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-zinc-400 italic">
                      Không tìm thấy chi tiết sản phẩm.
                    </td>
                  </tr>
                ) : (
                  order.items.map((item: OrderItem) => (
                    <tr key={item.id}>
                      <td className="py-2.5 pr-2 font-bold text-zinc-800">{item.product_name}</td>
                      <td className="py-2.5 px-2 text-right font-mono">{Number(item.unit_price).toLocaleString('vi-VN')}đ</td>
                      <td className="py-2.5 px-2 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 pl-2 text-right font-mono font-bold text-[#09090B]">{Number(item.subtotal).toLocaleString('vi-VN')}đ</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t-2 border-[#09090B] pt-4 mt-6">
          <button
            onClick={() => {
              onClose();
              onOpenEdit(order);
            }}
            className="px-4 py-2 border-2 border-[#09090B] bg-white text-[#09090B] font-mono text-xs font-bold uppercase hover:bg-zinc-50 flex items-center gap-1.5"
          >
            <Edit size={12} />
            Sửa đơn
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border-2 border-[#09090B] bg-[#09090B] text-white font-mono text-xs font-bold uppercase hover:bg-zinc-800"
          >
            Đóng chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
