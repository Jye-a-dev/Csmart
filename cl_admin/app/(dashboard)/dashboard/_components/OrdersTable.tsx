'use client';

import { Order, OrderStatus } from '@/types/entities/order';
import { RefreshCw } from 'lucide-react';

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
}

export default function OrdersTable({ orders, loading, onRefresh }: OrdersTableProps) {
  return (
    <div className="border-4 border-[#09090B] bg-white p-8 shadow-[4px_4px_0px_0px_#09090B]">
      <div className="flex items-center justify-between border-b-4 border-[#09090B] pb-4 mb-6">
        <h3 className="text-xl font-black text-[#09090B] uppercase tracking-tight">
          Danh sách đơn hàng vận hành
        </h3>
        <button
          onClick={onRefresh}
          className="p-2 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-[#09090B] font-mono text-xs uppercase text-zinc-500">
              <th className="py-3 pr-4">Mã Đơn hàng</th>
              <th className="py-3 px-4">Địa chỉ giao nhận</th>
              <th className="py-3 px-4 text-right">Giá trị đơn</th>
              <th className="py-3 pl-4 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 text-sm">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-zinc-500 font-mono text-xs">
                  Không tìm thấy đơn hàng nào trong hệ thống.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-4 pr-4 font-mono font-bold text-[#09090B]">
                    {order.order_code}
                  </td>
                  <td className="py-4 px-4 text-zinc-600 max-w-50 truncate">
                    {order.shipping_address}
                  </td>
                  <td className="py-4 px-4 text-right font-bold text-[#09090B]">
                    {Number(order.total_amount).toLocaleString('vi-VN')}đ
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 border border-[#09090B] shadow-[1px_1px_0px_0px_#09090B] ${
                      order.status === OrderStatus.DELIVERED ? 'bg-emerald-100 text-emerald-800' :
                      order.status === OrderStatus.PENDING ? 'bg-amber-100 text-amber-800 animate-pulse' :
                      order.status === OrderStatus.CANCELLED ? 'bg-rose-100 text-rose-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
