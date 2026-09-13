'use client';

import React, { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Package, Truck, CheckCircle2, ArrowRight, ShoppingBag, Plus } from 'lucide-react';
import { useOrders } from '@/hooks';
import { Order, CreateOrderDto } from '@/types/entities/order';
import type { User } from '@/types/entities/user';
import {
  OrderCard,
  OrderDetailModal,
  CancelOrderModal,
  OrderFilterBar,
  CreateOrderModal,
} from './sections';

let _cachedRaw: string | null = null;
let _cachedUser: User | null = null;

function getUserSnapshot(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  if (raw === _cachedRaw) return _cachedUser;
  _cachedRaw = raw;
  if (!raw) {
    _cachedUser = null;
    return null;
  }
  try {
    _cachedUser = JSON.parse(raw) as User;
  } catch {
    _cachedUser = null;
  }
  return _cachedUser;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('auth-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('auth-change', callback);
  };
}

export default function UserOrdersPage() {
  const user = useSyncExternalStore(subscribe, getUserSnapshot, () => null);
  const { findAllOrders, createOrder, cancelOrder, loading: orderLoading } = useOrders();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const handleCreateOrder = async (payload: CreateOrderDto) => {
    await createOrder(payload);
    showToast('Tạo đơn hàng mới thành công!');
    await fetchOrders();
  };

  const fetchOrders = useCallback(async () => {
    try {
      const data = await findAllOrders({
        user_id: user?.id,
        limit: 50,
      });
      if (data) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  }, [findAllOrders, user]);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      await Promise.resolve();
      if (!isMounted) return;
      try {
        const data = await findAllOrders({
          user_id: user?.id,
          limit: 50,
        });
        if (isMounted && data) {
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [findAllOrders, user]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab = selectedTab === 'ALL' || order.status === selectedTab;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        order.order_code.toLowerCase().includes(q) ||
        order.shipping_address.toLowerCase().includes(q) ||
        (order.items && order.items.some((item) => item.product_name.toLowerCase().includes(q)));
      return matchesTab && matchesSearch;
    });
  }, [orders, selectedTab, searchQuery]);

  const handleConfirmCancel = async (finalReason: string) => {
    if (!cancelModalOrder) return;
    setCancelling(true);
    try {
      await cancelOrder(cancelModalOrder.id, finalReason);
      showToast(`Đã hủy thành công đơn hàng #${cancelModalOrder.order_code}`);
      setCancelModalOrder(null);
      void fetchOrders();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể hủy đơn hàng này.';
      showToast(msg);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-w-0 flex-1 space-y-6 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-zinc-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-linear-to-r from-orange-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-3">
              <Package size={14} /> Quản Lý Mua Sắm
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Đơn Hàng Của Tôi</h1>
            <p className="mt-2 text-sm text-orange-100/90 leading-relaxed">
              Theo dõi hành trình bưu kiện, tra cứu chi tiết giao nhận và quản lý đơn hàng minh bạch theo thời gian thực.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-orange-600 hover:bg-orange-50 font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Tạo Đơn Hàng Mới</span>
          </button>
        </div>
        <div className="absolute -right-5 -bottom-5 opacity-10 pointer-events-none">
          <Truck size={220} />
        </div>
      </div>

      {/* Search & Tabs Filter */}
      <OrderFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedTab={selectedTab}
        onSelectTab={setSelectedTab}
        orders={orders}
      />

      {/* Orders List */}
      <div className="space-y-4">
        {orderLoading && orders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200">
            <div className="w-10 h-10 border-3 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-zinc-500">Đang tải danh sách đơn hàng...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200/80 shadow-xs space-y-4">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto">
              <ShoppingBag size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Không tìm thấy đơn hàng nào</h3>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'Không có đơn hàng nào khớp với từ khóa tìm kiếm của bạn.'
                  : 'Bạn chưa có đơn hàng nào ở trạng thái này. Hãy tạo đơn hàng hoặc khám phá sản phẩm!'}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-700 transition-colors shadow-sm cursor-pointer"
              >
                <Plus size={15} />
                <span>Tạo Đơn Hàng Mới</span>
              </button>
              <Link
                href="/user"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-700 text-xs font-bold hover:bg-zinc-200 transition-colors"
              >
                <span>Mua Sắm Ngay</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onCancel={(target) => setCancelModalOrder(target)}
              onViewDetail={(target) => setSelectedOrder(target)}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <CreateOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        userId={user?.id ? String(user.id) : undefined}
        onCreate={handleCreateOrder}
      />

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      <CancelOrderModal
        order={cancelModalOrder}
        cancelling={cancelling}
        onClose={() => setCancelModalOrder(null)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
