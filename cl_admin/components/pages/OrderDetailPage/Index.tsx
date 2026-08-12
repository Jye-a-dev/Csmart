'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/hooks';
import { Order, OrderStatus, OrderItem, ItemShippingStatus, UpdateOrderDto } from '@/types/entities/order';
import { apiClient } from '@/libs/api-client';
import {
  ShoppingBag, ArrowLeft, RefreshCw, Save, Truck, Package,
  MapPin, StickyNote, Clock, Loader2,
} from 'lucide-react';

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'bg-amber-100 text-amber-700',
  [OrderStatus.PROCESSING]: 'bg-blue-100 text-blue-700',
  [OrderStatus.SHIPPED]: 'bg-purple-100 text-purple-700',
  [OrderStatus.DELIVERED]: 'bg-emerald-100 text-emerald-700',
  [OrderStatus.CANCELLED]: 'bg-rose-100 text-rose-700',
  [OrderStatus.REFUNDED]: 'bg-zinc-100 text-zinc-600',
};

const ITEM_STATUS_COLORS: Record<ItemShippingStatus, string> = {
  [ItemShippingStatus.PENDING]: 'bg-zinc-100 text-zinc-600',
  [ItemShippingStatus.PREPARING]: 'bg-amber-100 text-amber-700',
  [ItemShippingStatus.SHIPPED]: 'bg-blue-100 text-blue-700',
  [ItemShippingStatus.IN_TRANSIT]: 'bg-purple-100 text-purple-700',
  [ItemShippingStatus.DELIVERED]: 'bg-emerald-100 text-emerald-700',
  [ItemShippingStatus.RETURNED]: 'bg-orange-100 text-orange-700',
  [ItemShippingStatus.CANCELLED]: 'bg-rose-100 text-rose-700',
};

const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

interface ItemShippingEdit {
  shipping_status: ItemShippingStatus;
  courier_name: string;
  tracking_number: string;
}

export default function OrderDetailPage({ orderId }: { orderId: number }) {
  const router = useRouter();
  const { loading, findOneOrder, updateOrder } = useOrders();

  const [order, setOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [cancelReason, setCancelReason] = useState('');
  const [itemEdits, setItemEdits] = useState<Record<number, ItemShippingEdit>>({});
  const [saving, setSaving] = useState(false);
  const [savingItems, setSavingItems] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    try {
      const o = await findOneOrder(orderId);
      setOrder(o);
      setOrderStatus(o.status);
      setCancelReason(o.cancel_reason ?? '');
      const edits: Record<number, ItemShippingEdit> = {};
      (o.items ?? []).forEach((item) => {
        edits[item.id] = {
          shipping_status: item.shipping_status,
          courier_name: item.courier_name ?? '',
          tracking_number: item.tracking_number ?? '',
        };
      });
      setItemEdits(edits);
    } catch {
      showToast('Không thể tải đơn hàng', 'err');
    }
  }, [orderId, findOneOrder]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const handleSaveOrderStatus = async () => {
    setSaving(true);
    try {
      const dto: UpdateOrderDto = { status: orderStatus };
      if (orderStatus === OrderStatus.CANCELLED && cancelReason) dto.cancel_reason = cancelReason;
      await updateOrder(orderId, dto);
      showToast('Đã cập nhật trạng thái đơn hàng!');
      void load();
    } catch {
      showToast('Lỗi khi cập nhật trạng thái', 'err');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveItem = async (itemId: number) => {
    const edit = itemEdits[itemId];
    if (!edit) return;
    setSavingItems((prev) => ({ ...prev, [itemId]: true }));
    try {
      await apiClient(`/orders/${orderId}/items/${itemId}`, {
        method: 'PATCH',
        body: {
          shipping_status: edit.shipping_status,
          courier_name: edit.courier_name || undefined,
          tracking_number: edit.tracking_number || undefined,
        },
      });
      showToast(`Đã cập nhật item #${itemId}`);
      void load();
    } catch {
      showToast(`Lỗi khi cập nhật item #${itemId}`, 'err');
    } finally {
      setSavingItems((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const setItemEdit = (id: number, patch: Partial<ItemShippingEdit>) =>
    setItemEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  if (loading && !order) {
    return (
      <div className="flex items-center justify-center py-24 font-mono text-zinc-500">
        <Loader2 size={20} className="animate-spin mr-2" /> Đang tải đơn hàng...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24 font-mono">
        <p className="text-zinc-500">Không tìm thấy đơn hàng #{orderId}</p>
        <button onClick={() => router.push('/orders')} className="mt-4 px-4 py-2 border-2 border-[#09090B] font-mono text-xs font-black shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none transition-all cursor-pointer">
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-5xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 border-2 border-[#09090B] font-mono text-xs font-bold shadow-[4px_4px_0px_0px_#09090B] ${toast.type === 'ok' ? 'bg-emerald-400 text-[#09090B]' : 'bg-rose-400 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-[#09090B] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <button onClick={() => router.push('/orders')} className="p-2 border-2 border-[#09090B] bg-white shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
              <ArrowLeft size={16} />
            </button>
            <div className="p-2 bg-[#09090B] text-[#F97316]"><ShoppingBag size={20} /></div>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase text-[#09090B]">{order.order_code}</h1>
            <span className={`px-3 py-1 border-2 border-[#09090B] font-mono text-xs font-black uppercase ${ORDER_STATUS_COLORS[order.status]}`}>{order.status}</span>
          </div>
          <p className="font-mono text-xs text-zinc-500 ml-24">
            Tạo lúc: {new Date(order.created_at).toLocaleString('vi-VN')}
          </p>
        </div>
        <button onClick={load} className="p-3 border-2 border-[#09090B] bg-white shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order Info + Status Update */}
        <div className="lg:col-span-1 space-y-6">
          {/* Info Card */}
          <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
            <div className="bg-[#09090B] text-white px-4 py-2.5 font-mono text-xs font-black uppercase">Thông tin đơn hàng</div>
            <div className="p-4 space-y-3 font-mono text-xs">
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-[#F97316] mt-0.5 shrink-0" />
                <div><span className="font-black text-zinc-500 uppercase">Địa chỉ:</span><p className="text-[#09090B] mt-0.5">{order.shipping_address}</p></div>
              </div>
              {order.note && (
                <div className="flex items-start gap-2">
                  <StickyNote size={13} className="text-[#F97316] mt-0.5 shrink-0" />
                  <div><span className="font-black text-zinc-500 uppercase">Ghi chú:</span><p className="text-[#09090B] mt-0.5 italic">{order.note}</p></div>
                </div>
              )}
              {order.cancel_reason && (
                <div className="flex items-start gap-2">
                  <Clock size={13} className="text-rose-500 mt-0.5 shrink-0" />
                  <div><span className="font-black text-rose-500 uppercase">Lý do hủy:</span><p className="text-rose-600 mt-0.5">{order.cancel_reason}</p></div>
                </div>
              )}
              <div className="border-t border-zinc-200 pt-3 space-y-1.5">
                <div className="flex justify-between"><span className="text-zinc-500">Tổng tiền hàng</span><span className="font-black">{fmt(order.total_amount)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Phí ship</span><span>{fmt(order.shipping_fee)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-500">Giảm giá</span><span className="text-emerald-600">-{fmt(order.discount_amount)}</span></div>
                <div className="flex justify-between border-t border-[#09090B] pt-2 mt-2"><span className="font-black text-[#09090B]">Thanh toán</span><span className="font-black text-[#F97316] text-sm">{fmt(order.total_amount + order.shipping_fee - order.discount_amount)}</span></div>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
            <div className="bg-[#09090B] text-white px-4 py-2.5 font-mono text-xs font-black uppercase">Cập nhật trạng thái</div>
            <div className="p-4 space-y-3">
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
                className="w-full border-2 border-[#09090B] px-3 py-2.5 font-mono text-xs focus:outline-none shadow-[2px_2px_0px_0px_#09090B] bg-white"
              >
                {Object.values(OrderStatus).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {orderStatus === OrderStatus.CANCELLED && (
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="Lý do hủy đơn..."
                  className="w-full border-2 border-[#09090B] px-3 py-2 font-mono text-xs focus:outline-none resize-none bg-white"
                />
              )}
              <button
                onClick={handleSaveOrderStatus}
                disabled={saving}
                className="w-full py-2.5 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black text-xs uppercase shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                Lưu Trạng Thái
              </button>
            </div>
          </div>
        </div>

        {/* Right: Order Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
            <div className="bg-[#09090B] text-white px-4 py-2.5 font-mono text-xs font-black uppercase flex items-center gap-2">
              <Package size={14} className="text-[#F97316]" />
              Chi Tiết Items ({(order.items ?? []).length})
            </div>
            <div className="divide-y-2 divide-[#09090B]">
              {(order.items ?? []).length === 0 ? (
                <div className="p-8 text-center font-mono text-zinc-400 italic">Không có items.</div>
              ) : (order.items ?? []).map((item: OrderItem) => {
                const edit = itemEdits[item.id] ?? { shipping_status: item.shipping_status, courier_name: '', tracking_number: '' };
                const isSaving = savingItems[item.id];
                return (
                  <div key={item.id} className="p-4 space-y-3">
                    {/* Item Info */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-mono text-sm font-black text-[#09090B]">{item.product_name}</p>
                        <p className="font-mono text-xs text-zinc-500">
                          Số lượng: <strong>{item.quantity}</strong> × {fmt(item.unit_price)} = <strong className="text-[#F97316]">{fmt(item.subtotal)}</strong>
                        </p>
                      </div>
                      <span className={`px-2 py-1 border border-current font-mono text-[10px] font-black uppercase whitespace-nowrap ${ITEM_STATUS_COLORS[item.shipping_status]}`}>
                        {item.shipping_status}
                      </span>
                    </div>

                    {/* Shipping Edit */}
                    <div className="bg-zinc-50 border border-zinc-200 p-3 space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Truck size={12} className="text-[#F97316]" />
                        <span className="font-mono text-[10px] font-black text-zinc-500 uppercase">Cập nhật vận chuyển</span>
                      </div>
                      <select
                        value={edit.shipping_status}
                        onChange={(e) => setItemEdit(item.id, { shipping_status: e.target.value as ItemShippingStatus })}
                        className="w-full border-2 border-[#09090B] px-2 py-1.5 font-mono text-xs focus:outline-none bg-white"
                      >
                        {Object.values(ItemShippingStatus).map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <input value={edit.courier_name} onChange={(e) => setItemEdit(item.id, { courier_name: e.target.value })} placeholder="Đơn vị vận chuyển (VD: GHTK)" className="border-2 border-[#09090B] px-2 py-1.5 font-mono text-xs focus:outline-none bg-white" />
                        <input value={edit.tracking_number} onChange={(e) => setItemEdit(item.id, { tracking_number: e.target.value })} placeholder="Mã vận đơn" className="border-2 border-[#09090B] px-2 py-1.5 font-mono text-xs focus:outline-none bg-white" />
                      </div>
                      <button
                        onClick={() => handleSaveItem(item.id)}
                        disabled={isSaving}
                        className="px-4 py-1.5 border-2 border-[#09090B] bg-[#09090B] text-white font-mono font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />}
                        Lưu Item
                      </button>
                    </div>

                    {/* Current tracking info */}
                    {(item.courier_name || item.tracking_number) && (
                      <div className="font-mono text-[10px] text-zinc-400 flex gap-3">
                        {item.courier_name && <span>Đơn vị: <strong>{item.courier_name}</strong></span>}
                        {item.tracking_number && <span>Mã VĐ: <strong className="text-[#09090B]">{item.tracking_number}</strong></span>}
                        {item.estimated_delivery && <span>Dự kiến: {new Date(item.estimated_delivery).toLocaleDateString('vi-VN')}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
