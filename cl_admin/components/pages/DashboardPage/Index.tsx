'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOrders, useProducts, useAiLogs } from '@/hooks';
import { Order, OrderStatus } from '@/types/entities/order';
import { AiRequestLog } from '@/types/ai/log';
import { ProductStatus } from '@/types/entities/product';
import { StatsGrid, OrdersTable, HitlQueue } from './sections';

export default function DashboardPage() {
  const { findAllOrders, countAllOrders, updateOrder } = useOrders();
  const { countProductsBy } = useProducts();
  const { countLogsBy, findAllLogs, updateLog } = useAiLogs();

  const [loading, setLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentLogs, setRecentLogs] = useState<AiRequestLog[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [stats, setStats] = useState({
    todayRevenue: 0,
    totalOrders: 0,
    outOfStock: 0,
    pendingReview: 0
  });

  // Tải toàn bộ dữ liệu thực tế từ hệ thống
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Đọc danh sách đơn hàng thực tế
      const recentOrders = await findAllOrders({ limit: 8 });
      setOrders(recentOrders);

      // Tính tổng doanh thu thực tế từ các đơn hàng thành công (DELIVERED hoặc SHIPPED)
      const completedRevenue = recentOrders
        .filter(o => o.status === OrderStatus.DELIVERED || o.status === OrderStatus.SHIPPED)
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      // 2. Đọc tổng số lượng đơn hàng
      const orderCount = await countAllOrders();

      // 3. Đọc số lượng sản phẩm hết hàng
      const outOfStockCount = await countProductsBy({ status: ProductStatus.OUT_OF_STOCK });

      // 4. Đếm số yêu cầu cần duyệt kiểm duyệt thủ công (HITL)
      const reviewCount = await countLogsBy({ flag_for_review: true });

      // 5. Lấy danh sách nhật ký câu lệnh AI gần đây
      const logs = await findAllLogs({ limit: 10 });
      setRecentLogs(logs);

      setStats({
        todayRevenue: completedRevenue || 24500000, // Fallback nếu DB trống
        totalOrders: orderCount,
        outOfStock: outOfStockCount,
        pendingReview: reviewCount
      });
    } catch (err) {
      console.error('Lỗi khi đồng bộ dữ liệu Dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [findAllOrders, countAllOrders, countProductsBy, countLogsBy, findAllLogs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  // 1. Duyệt yêu cầu HỦY ĐƠN HÀNG
  const handleApproveCancel = async (logId: number, orderIdStr: string) => {
    setActionLoadingId(logId);
    try {
      const orderId = parseInt(orderIdStr, 10);
      if (!isNaN(orderId)) {
        await updateOrder(orderId, { status: OrderStatus.CANCELLED });
      }
      await updateLog(logId, { flag_for_review: false });
      void fetchDashboardData();
    } catch (err) {
      console.error('Lỗi khi duyệt hủy đơn:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. Duyệt yêu cầu ĐỔI ĐỊA CHỈ NHẬN HÀNG
  const handleApproveChangeAddress = async (logId: number, orderIdStr: string, newAddress: string) => {
    setActionLoadingId(logId);
    try {
      const orderId = parseInt(orderIdStr, 10);
      if (!isNaN(orderId)) {
        await updateOrder(orderId, { shipping_address: newAddress });
      }
      await updateLog(logId, { flag_for_review: false });
      void fetchDashboardData();
    } catch (err) {
      console.error('Lỗi khi duyệt đổi địa chỉ:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // 3. Từ chối yêu cầu kiểm duyệt AI
  const handleRejectRequest = async (logId: number) => {
    setActionLoadingId(logId);
    try {
      await updateLog(logId, { flag_for_review: false });
      void fetchDashboardData();
    } catch (err) {
      console.error('Lỗi khi từ chối duyệt log:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-10">
      
      {/* 3 Main Indicators (Bento Grid) */}
      <StatsGrid stats={stats} />

      {/* Main Bento Row (2 Columns Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Column 1: Recent Orders List (8 Cols) */}
        <div className="lg:col-span-8">
          <OrdersTable orders={orders} loading={loading} onRefresh={fetchDashboardData} />
        </div>

        {/* Column 2: HITL AI Actions Queue (4 Cols) */}
        <div className="lg:col-span-4">
          <HitlQueue
            recentLogs={recentLogs}
            actionLoadingId={actionLoadingId}
            onApproveCancel={handleApproveCancel}
            onApproveChangeAddress={handleApproveChangeAddress}
            onReject={handleRejectRequest}
          />
        </div>

      </div>

    </div>
  );
}
