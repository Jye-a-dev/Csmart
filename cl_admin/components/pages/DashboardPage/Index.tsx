'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOrders, useProducts, useAiLogs } from '@/hooks';
import { Order, OrderStatus } from '@/types/entities/order';
import { AiRequestLog } from '@/types/ai/log';
import { ProductStatus } from '@/types/entities/product';
import { StatsGrid, DashboardBento } from './sections';

export default function DashboardPage() {
  const { findAllOrders, countAllOrders, getTotalRevenue, updateOrder } = useOrders();
  const { countProductsBy } = useProducts();
  const { countLogsBy, findAllLogs, updateLog } = useAiLogs();

  const [loading, setLoading] = useState<boolean>(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentLogs, setRecentLogs] = useState<AiRequestLog[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

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

      // 2. Lấy tổng doanh thu thực tế trực tiếp từ toàn bộ đơn hàng trong DB
      const completedRevenue = await getTotalRevenue();

      // 3. Đọc tổng số lượng đơn hàng
      const orderCount = await countAllOrders();

      // 4. Đọc số lượng sản phẩm hết hàng
      const outOfStockCount = await countProductsBy({ status: ProductStatus.OUT_OF_STOCK });

      // 5. Đếm số yêu cầu cần duyệt kiểm duyệt thủ công (HITL)
      const reviewCount = await countLogsBy({ flag_for_review: true });

      // 6. Lấy danh sách nhật ký câu lệnh AI gần đây
      const logs = await findAllLogs({ limit: 10 });
      setRecentLogs(logs);

      setStats({
        todayRevenue: completedRevenue, // Dữ liệu thật từ DB, không mock fallback
        totalOrders: orderCount,
        outOfStock: outOfStockCount,
        pendingReview: reviewCount
      });
    } catch (err) {
      console.error('Lỗi khi đồng bộ dữ liệu Dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [findAllOrders, getTotalRevenue, countAllOrders, countProductsBy, countLogsBy, findAllLogs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  // 1. Duyệt yêu cầu HỦY ĐƠN HÀNG
  const handleApproveCancel = async (logId: string, orderIdStr: string) => {
    setActionLoadingId(logId);
    try {
      if (orderIdStr) {
        await updateOrder(orderIdStr, { status: OrderStatus.CANCELLED });
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
  const handleApproveChangeAddress = async (logId: string, orderIdStr: string, newAddress: string) => {
    setActionLoadingId(logId);
    try {
      if (orderIdStr) {
        await updateOrder(orderIdStr, { shipping_address: newAddress });
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
  const handleRejectRequest = async (logId: string) => {
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
    <div className="space-y-10 font-sans">
      <StatsGrid stats={stats} />
      
      <DashboardBento
        orders={orders}
        loading={loading}
        onRefresh={fetchDashboardData}
        recentLogs={recentLogs}
        actionLoadingId={actionLoadingId}
        onApproveCancel={handleApproveCancel}
        onApproveChangeAddress={handleApproveChangeAddress}
        onReject={handleRejectRequest}
      />
    </div>
  );
}
