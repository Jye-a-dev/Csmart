'use client';

import { Order } from '@/types/entities/order';
import { AiRequestLog } from '@/types/ai/log';
import OrdersTable from './OrdersTable';
import HitlQueue from './HitlQueue';

interface DashboardBentoProps {
  orders: Order[];
  loading: boolean;
  onRefresh: () => void;
  recentLogs: AiRequestLog[];
  actionLoadingId: number | null;
  onApproveCancel: (logId: number, orderIdStr: string) => Promise<void>;
  onApproveChangeAddress: (logId: number, orderIdStr: string, newAddress: string) => Promise<void>;
  onReject: (logId: number) => Promise<void>;
}

export default function DashboardBento({
  orders,
  loading,
  onRefresh,
  recentLogs,
  actionLoadingId,
  onApproveCancel,
  onApproveChangeAddress,
  onReject
}: DashboardBentoProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Column 1: Recent Orders List (8 Cols) */}
      <div className="lg:col-span-8">
        <OrdersTable orders={orders} loading={loading} onRefresh={onRefresh} />
      </div>

      {/* Column 2: HITL AI Actions Queue (4 Cols) */}
      <div className="lg:col-span-4">
        <HitlQueue
          recentLogs={recentLogs}
          actionLoadingId={actionLoadingId}
          onApproveCancel={onApproveCancel}
          onApproveChangeAddress={onApproveChangeAddress}
          onReject={onReject}
        />
      </div>
    </div>
  );
}
