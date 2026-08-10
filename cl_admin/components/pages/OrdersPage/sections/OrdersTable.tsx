'use client';

import { Order, OrderStatus } from '@/types/entities/order';
import { User } from '@/types/entities/user';
import {
  RefreshCw,
  Search,
  ChevronDown,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface OrdersTableProps {
  orders: Order[];
  users: User[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  onRefresh: () => void;
  onViewDetails: (order: Order) => void;
  onOpenEdit: (order: Order) => void;
  onDelete: (id: number) => void;
  formatUserUuid: (user: User) => string;
}

export default function OrdersTable({
  orders,
  users,
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onRefresh,
  onViewDetails,
  onOpenEdit,
  onDelete,
  formatUserUuid
}: OrdersTableProps) {
  
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

  return (
    <div className="space-y-6">
      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-8 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã đơn hàng, địa chỉ, ghi chú..."
            className="w-full pl-10 pr-4 py-3 border-2 border-[#09090B] focus:outline-none focus:bg-zinc-50 font-mono text-sm bg-white shadow-[3px_3px_0px_0px_#09090B]"
          />
        </div>
        
        {/* Status Dropdown */}
        <div className="md:col-span-4 relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#09090B] focus:outline-none font-mono text-sm bg-white shadow-[3px_3px_0px_0px_#09090B] appearance-none cursor-pointer"
          >
            <option value="ALL">TẤT CẢ TRẠNG THÁI</option>
            <option value={OrderStatus.PENDING}>PENDING (CHỜ DUYỆT)</option>
            <option value={OrderStatus.PROCESSING}>PROCESSING (ĐANG XỬ LÝ)</option>
            <option value={OrderStatus.SHIPPED}>SHIPPED (ĐÃ GIAO ĐỐI TÁC)</option>
            <option value={OrderStatus.DELIVERED}>DELIVERED (THÀNH CÔNG)</option>
            <option value={OrderStatus.CANCELLED}>CANCELLED (ĐÃ HỦY)</option>
            <option value={OrderStatus.REFUNDED}>REFUNDED (HOÀN TIỀN)</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-600">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Orders Table Listing */}
      <div className="border-4 border-[#09090B] bg-white p-6 shadow-[6px_6px_0px_0px_#09090B] overflow-hidden">
        <div className="flex items-center justify-between border-b-4 border-[#09090B] pb-4 mb-6">
          <h3 className="text-lg font-black text-[#09090B] uppercase tracking-tight">
            Danh sách đơn hàng vận hành
          </h3>
          <button
            onClick={onRefresh}
            className="p-2 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
            title="Đồng bộ dữ liệu"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-[#09090B] font-mono text-xs uppercase text-zinc-500">
                <th className="py-3.5 pr-4">Mã Đơn</th>
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Ngày Tạo</th>
                <th className="py-3.5 px-4">Địa Chi Nhận</th>
                <th className="py-3.5 px-4 text-right">Tổng Tiền</th>
                <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                <th className="py-3.5 pl-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 text-sm">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500 font-mono text-xs italic">
                    Không tìm thấy đơn hàng nào khớp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-4 pr-4 font-mono font-bold text-[#09090B]">
                      {order.order_code}
                    </td>
                    <td className="py-4 px-4 text-[#09090B] text-xs">
                      {(() => {
                        const orderUser = users.find((u) => u.id === order.user_id);
                        return orderUser ? (
                          <div className="flex flex-col text-left font-mono">
                            <span className="font-bold font-sans text-xs">{orderUser.full_name}</span>
                            <span className="text-[10px] text-zinc-400">{formatUserUuid(orderUser)}</span>
                          </div>
                        ) : (
                          <span className="italic text-zinc-400 font-mono text-xs">Không xác định</span>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-4 text-zinc-500 font-mono text-xs">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')} {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-4 text-zinc-600 max-w-xs truncate" title={order.shipping_address}>
                      {order.shipping_address}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-[#09090B]">
                      {Number(order.total_amount).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block font-mono text-[10px] font-bold px-2.5 py-0.5 border-2 border-[#09090B] shadow-[1px_1px_0px_0px_#09090B] uppercase ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onViewDetails(order)}
                          className="p-1.5 border-2 border-[#09090B] bg-[#FAFAFA] text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                          title="Chi tiết"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => onOpenEdit(order)}
                          className="p-1.5 border-2 border-[#09090B] bg-[#FAFAFA] text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                          title="Sửa"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => onDelete(order.id)}
                          className="p-1.5 border-2 border-[#09090B] bg-rose-100 text-rose-700 shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
