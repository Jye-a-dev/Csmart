'use client';

import { OrderItem, ItemShippingStatus } from '@/types/entities/order';
import { Package, Truck, Save, Loader2 } from 'lucide-react';
import { fmt } from './OrderInfoCard';

export const ITEM_STATUS_COLORS: Record<ItemShippingStatus, string> = {
  [ItemShippingStatus.PENDING]: 'bg-zinc-100 text-zinc-600',
  [ItemShippingStatus.PREPARING]: 'bg-amber-100 text-amber-700',
  [ItemShippingStatus.SHIPPED]: 'bg-blue-100 text-blue-700',
  [ItemShippingStatus.IN_TRANSIT]: 'bg-purple-100 text-purple-700',
  [ItemShippingStatus.DELIVERED]: 'bg-emerald-100 text-emerald-700',
  [ItemShippingStatus.RETURNED]: 'bg-orange-100 text-orange-700',
  [ItemShippingStatus.CANCELLED]: 'bg-rose-100 text-rose-700',
};

export interface ItemShippingEdit {
  shipping_status: ItemShippingStatus;
  courier_name: string;
  tracking_number: string;
}

interface OrderItemsSectionProps {
  items: OrderItem[];
  itemEdits: Record<string, ItemShippingEdit>;
  savingItems: Record<string, boolean>;
  setItemEdit: (id: string, patch: Partial<ItemShippingEdit>) => void;
  onSaveItem: (itemId: string) => void;
}

export function OrderItemsSection({
  items,
  itemEdits,
  savingItems,
  setItemEdit,
  onSaveItem,
}: OrderItemsSectionProps) {
  return (
    <div className="border-2 border-[#09090B] shadow-[4px_4px_0px_0px_#09090B] bg-white">
      <div className="bg-[#09090B] text-white px-4 py-2.5 font-mono text-xs font-black uppercase flex items-center gap-2">
        <Package size={14} className="text-[#F97316]" />
        Chi Tiết Items ({items.length})
      </div>
      <div className="divide-y-2 divide-[#09090B]">
        {items.length === 0 ? (
          <div className="p-8 text-center font-mono text-zinc-400 italic">Không có items.</div>
        ) : items.map((item: OrderItem) => {
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
                  onClick={() => onSaveItem(item.id)}
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
  );
}
