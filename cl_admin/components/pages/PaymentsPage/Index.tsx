'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePayments } from '@/hooks';
import { Payment, PaymentMethod, PaymentStatus } from '@/types/entities/payment';
import { CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';
import {
  PaymentsHeader,
  PaymentsStats,
  PaymentsBreakdown,
  PaymentsFilters,
  PaymentsTable,
} from './sections';

const STATUS_CONFIG: Record<PaymentStatus, { label: string; cls: string; icon: React.ElementType }> = {
  [PaymentStatus.PENDING]: { label: 'Chờ thanh toán', cls: 'bg-amber-100 text-amber-700', icon: Clock },
  [PaymentStatus.COMPLETED]: { label: 'Thành công', cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  [PaymentStatus.FAILED]: { label: 'Thất bại', cls: 'bg-rose-100 text-rose-700', icon: XCircle },
  [PaymentStatus.REFUNDED]: { label: 'Hoàn tiền', cls: 'bg-orange-100 text-orange-700', icon: RotateCcw },
};

const fmt = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function PaymentsPage() {
  const { loading, findAllPayments } = usePayments();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'ALL'>('ALL');

  const load = useCallback(async () => {
    try {
      const data = await findAllPayments({ limit: 500 });
      setPayments(data || []);
    } catch {
      console.error('Failed to load payments');
    }
  }, [findAllPayments]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 0);
    return () => clearTimeout(t);
  }, [load]);

  const filtered = payments.filter((p) => {
    const methodMatch = methodFilter === 'ALL' || p.payment_method === methodFilter;
    const statusMatch = statusFilter === 'ALL' || p.payment_status === statusFilter;
    const searchMatch = !search || String(p.order_id).includes(search) || (p.transaction_code ?? '').toLowerCase().includes(search.toLowerCase());
    return methodMatch && statusMatch && searchMatch;
  });

  // Stats
  const totalAmount = payments.filter((p) => p.payment_status === PaymentStatus.COMPLETED).reduce((s, p) => s + p.amount, 0);
  const completedCount = payments.filter((p) => p.payment_status === PaymentStatus.COMPLETED).length;
  const failedCount = payments.filter((p) => p.payment_status === PaymentStatus.FAILED).length;
  const pendingCount = payments.filter((p) => p.payment_status === PaymentStatus.PENDING).length;

  // Breakdown by method
  const methodBreakdown = Object.values(PaymentMethod).map((m) => ({
    method: m,
    count: payments.filter((p) => p.payment_method === m).length,
    amount: payments.filter((p) => p.payment_method === m && p.payment_status === PaymentStatus.COMPLETED).reduce((s, p) => s + p.amount, 0),
  })).filter((m) => m.count > 0);

  // Status counts map
  const statusCounts = Object.values(PaymentStatus).reduce((acc, s) => {
    acc[s] = payments.filter((p) => p.payment_status === s).length;
    return acc;
  }, {} as Record<PaymentStatus, number>);

  return (
    <div className="space-y-8 font-sans">
      {/* Header Section */}
      <PaymentsHeader loading={loading} onRefresh={load} />

      {/* Stats Cards Section */}
      <PaymentsStats
        totalAmountStr={fmt(totalAmount)}
        completedCount={completedCount}
        failedCount={failedCount}
        pendingCount={pendingCount}
      />

      {/* Method & Status Breakdown Section */}
      <PaymentsBreakdown
        methodBreakdown={methodBreakdown}
        totalPaymentsCount={payments.length}
        fmt={fmt}
        statusConfig={STATUS_CONFIG}
        statusCounts={statusCounts}
      />

      {/* Filters Section */}
      <PaymentsFilters
        search={search}
        setSearch={setSearch}
        methodFilter={methodFilter}
        setMethodFilter={setMethodFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusConfig={STATUS_CONFIG}
      />

      {/* Table Section */}
      <PaymentsTable
        loading={loading}
        filtered={filtered}
        fmt={fmt}
        statusConfig={STATUS_CONFIG}
      />
    </div>
  );
}
