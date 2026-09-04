import React from 'react';
import type { Order } from '@/types/entities/order';
import { Package, ChevronRight, Clock } from 'lucide-react';

export interface UserPortalRecentOrdersSectionProps {
  orders: Order[];
  loading: boolean;
}

export function UserPortalRecentOrdersSection({
  orders,
  loading,
}: UserPortalRecentOrdersSectionProps) {
  return (
    <section id="orders" className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="mx-auto max-w-7xl">
        <div className="p-6 rounded-3xl bg-white border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Package size={16} />
              </div>
              <div>
                <h2 className="text-base font-black text-zinc-900 tracking-tight">
                  Đơn Hàng Gần Đây Của Bạn
                </h2>
                <p className="text-xs text-zinc-500">Cập nhật lộ trình giao hàng trực tiếp</p>
              </div>
            </div>

            <a
              href="#featured-products"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ChevronRight size={14} />
            </a>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-zinc-400 animate-pulse">
              Đang tải danh sách đơn hàng...
            </div>
          ) : orders.length === 0 ? (
            <div className="py-8 px-4 text-center rounded-2xl bg-zinc-50 border border-dashed border-zinc-200">
              <Package className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-zinc-700">Bạn chưa có đơn hàng nào gần đây</p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Khám phá danh mục sản phẩm bên dưới để nhận voucher giảm 50.000đ!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-zinc-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-zinc-900">
                        #{order.order_code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          order.status === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'SHIPPED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      {order.items?.length || 1} sản phẩm • Tổng thanh toán:{' '}
                      <strong className="text-zinc-900">
                        {Number(order.total_amount).toLocaleString('vi-VN')}₫
                      </strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                      <Clock size={12} />
                      <span>Dự kiến: 24h</span>
                    </span>
                    <a
                      href="#featured-products"
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 text-xs font-bold border border-zinc-200 shadow-2xs transition-all"
                    >
                      Mua Lại
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
