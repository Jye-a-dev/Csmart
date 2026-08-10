'use client';

import { useState, useEffect, useCallback } from 'react';
import { useOrders, useUsers } from '@/hooks';
import { Order, OrderStatus, CreateOrderDto, UpdateOrderDto } from '@/types/entities/order';
import { User } from '@/types/entities/user';
import {
  OrdersTable,
  CreateOrderModal,
  EditOrderModal,
  OrderDetailModal,
  OrdersHeader
} from './sections';

export default function OrdersPage() {
  const {
    loading,
    findAllOrders,
    createOrder,
    updateOrder,
    removeOrder
  } = useOrders();

  const { findAllUsers } = useUsers();

  // State
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals Visibility
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Load orders from backend
  const loadOrders = useCallback(async () => {
    try {
      const data = await findAllOrders({ limit: 100 });
      setOrders(data || []);
    } catch {
      console.error('Failed to load orders');
    }
  }, [findAllOrders]);

  // Load users from backend
  const loadUsers = useCallback(async () => {
    try {
      const data = await findAllUsers({ limit: 200 });
      setUsers(data || []);
    } catch {
      console.error('Failed to load users');
    }
  }, [findAllUsers]);

  // Fetch initial data
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOrders();
      void loadUsers();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadOrders, loadUsers]);

  // Format user display ID based on role prefix and uuid v4
  const formatUserUuid = useCallback((user: User) => {
    const prefix = user.role === 'ADMIN' ? 'ad' : user.role === 'SUPPORT' ? 'sp' : 'cs';
    return `${prefix}-${user.uuid}`;
  }, []);

  // Filtered orders list mapping
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.note && order.note.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // CRUD Operations callbacks passed to child modal sections
  const handleCreateSubmit = async (payload: CreateOrderDto) => {
    await createOrder(payload);
    void loadOrders();
  };

  const handleEditSubmit = async (id: number, payload: UpdateOrderDto) => {
    await updateOrder(id, payload);
    void loadOrders();
    // Update selectedOrder details state if active
    if (selectedOrder?.id === id) {
      const updatedOrder = await findAllOrders({ limit: 100 });
      setOrders(updatedOrder || []);
      const refetched = updatedOrder?.find((o) => o.id === id);
      if (refetched) setSelectedOrder(refetched);
    }
  };

  const handleQuickStatusUpdate = async (id: number, status: OrderStatus) => {
    try {
      await updateOrder(id, { status });
      void loadOrders();
      setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
    } catch {
      alert('Không thể cập nhật trạng thái đơn hàng!');
    }
  };

  const handleDeleteOrder = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này không? Hành động này không thể hoàn tác.')) {
      try {
        await removeOrder(id);
        void loadOrders();
        if (selectedOrder?.id === id) {
          setIsDetailOpen(false);
        }
      } catch {
        alert('Lỗi khi xóa đơn hàng!');
      }
    }
  };

  const handleOpenEdit = (order: Order) => {
    setSelectedOrder(order);
    setIsEditOpen(true);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-8 font-sans">
      <OrdersHeader
        loading={loading}
        onRefresh={loadOrders}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      {/* Main Table view list */}
      <OrdersTable
        orders={filteredOrders}
        users={users}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onRefresh={loadOrders}
        onViewDetails={handleViewDetails}
        onOpenEdit={handleOpenEdit}
        onDelete={handleDeleteOrder}
        formatUserUuid={formatUserUuid}
      />

      {/* CREATE ORDER MODAL */}
      <CreateOrderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        users={users}
        onCreate={handleCreateSubmit}
        formatUserUuid={formatUserUuid}
      />

      {/* EDIT STATUS & INFO MODAL */}
      <EditOrderModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        order={selectedOrder}
        onUpdate={handleEditSubmit}
      />

      {/* DETAIL MODAL DRAWER */}
      <OrderDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        order={selectedOrder}
        users={users}
        formatUserUuid={formatUserUuid}
        onQuickStatusUpdate={handleQuickStatusUpdate}
        onOpenEdit={handleOpenEdit}
      />
    </div>
  );
}
