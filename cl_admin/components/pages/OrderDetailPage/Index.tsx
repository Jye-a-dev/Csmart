'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/hooks';
import { Order, OrderStatus, UpdateOrderDto } from '@/types/entities/order';
import { apiClient } from '@/libs/api-client';
import { Loader2 } from 'lucide-react';
import {
  OrderDetailHeader,
  OrderInfoCard,
  OrderStatusSection,
  OrderItemsSection,
  ItemShippingEdit,
} from './sections';

export default function OrderDetailPage({ orderId }: { orderId: string }) {
  const router = useRouter();
  const { loading, findOneOrder, updateOrder } = useOrders();

  const [order, setOrder] = useState<Order | null>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(OrderStatus.PENDING);
  const [cancelReason, setCancelReason] = useState('');
  const [itemEdits, setItemEdits] = useState<Record<string, ItemShippingEdit>>({});
  const [saving, setSaving] = useState(false);
  const [savingItems, setSavingItems] = useState<Record<string, boolean>>({});
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
      const edits: Record<string, ItemShippingEdit> = {};
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

  const handleSaveItem = async (itemId: string) => {
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

  const setItemEdit = (id: string, patch: Partial<ItemShippingEdit>) =>
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

      {/* Header Section */}
      <OrderDetailHeader
        orderCode={order.order_code}
        status={order.status}
        createdAt={order.created_at}
        loading={loading}
        onRefresh={load}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Info Card & Order Status Section */}
        <div className="lg:col-span-1 space-y-6">
          <OrderInfoCard order={order} />

          <OrderStatusSection
            orderStatus={orderStatus}
            setOrderStatus={setOrderStatus}
            cancelReason={cancelReason}
            setCancelReason={setCancelReason}
            saving={saving}
            onSave={handleSaveOrderStatus}
          />
        </div>

        {/* Right Column: Order Items Section */}
        <div className="lg:col-span-2 space-y-4">
          <OrderItemsSection
            items={order.items ?? []}
            itemEdits={itemEdits}
            savingItems={savingItems}
            setItemEdit={setItemEdit}
            onSaveItem={handleSaveItem}
          />
        </div>
      </div>
    </div>
  );
}
