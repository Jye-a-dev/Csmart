'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUsers } from '@/hooks';
import { User, CreateUserDto, UpdateUserDto } from '@/types/entities/user';
import {
  CustomersHeader,
  CustomersTable,
  CreateCustomerModal,
  EditCustomerModal,
  CustomerDetailModal,
  ConfirmDeleteModal,
} from './sections';

export default function CustomersPage() {
  const {
    loading,
    findAllUsers,
    countAllUsers,
    countUsersBy,
    createUser,
    updateUser,
    removeUser,
    findAddresses,
    createAddress,
    removeAddress,
  } = useUsers();

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [activeCount, setActiveCount] = useState<number>(0);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals Visibility
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load Users & Stats from backend
  const loadData = useCallback(async () => {
    try {
      const [data, total, active] = await Promise.all([
        findAllUsers({ limit: 200 }),
        countAllUsers(),
        countUsersBy({ is_active: true }),
      ]);

      setUsers(data || []);
      setTotalCount(total || 0);
      setActiveCount(active || 0);
    } catch {
      console.error('Lỗi khi tải danh sách người dùng!');
    }
  }, [findAllUsers, countAllUsers, countUsersBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Filtered Users List
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      user.uuid.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && user.is_active) ||
      (statusFilter === 'INACTIVE' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // CRUD Operations Callbacks
  const handleCreateSubmit = async (dto: CreateUserDto) => {
    await createUser(dto);
    void loadData();
  };

  const handleEditSubmit = async (id: number, dto: UpdateUserDto) => {
    await updateUser(id, dto);
    void loadData();
    if (selectedUser?.id === id) {
      setSelectedUser((prev) => (prev ? { ...prev, ...dto } : null));
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const updatedActive = !user.is_active;
      await updateUser(user.id, { is_active: updatedActive });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: updatedActive } : u))
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => (prev ? { ...prev, is_active: updatedActive } : null));
      }
    } catch {
      alert('Không thể thay đổi trạng thái người dùng!');
    }
  };

  const handleOpenDelete = (id: number) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await removeUser(deletingId);
      void loadData();
      if (selectedUser?.id === deletingId) {
        setIsDetailOpen(false);
      }
      setIsDeleteOpen(false);
      setDeletingId(null);
    } catch {
      alert('Lỗi khi xóa người dùng!');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditOpen(true);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* Header */}
      <CustomersHeader
        loading={loading}
        totalCount={totalCount}
        activeCount={activeCount}
        onRefresh={loadData}
        onCreateClick={() => setIsCreateOpen(true)}
      />

      {/* Main Table */}
      <CustomersTable
        users={filteredUsers}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onViewDetails={handleViewDetails}
        onOpenEdit={handleOpenEdit}
        onToggleActive={handleToggleActive}
        onDelete={handleOpenDelete}
      />

      {/* Modals */}
      <CreateCustomerModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateSubmit}
      />

      <EditCustomerModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={selectedUser}
        onUpdate={handleEditSubmit}
      />

      <CustomerDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        user={selectedUser}
        findAddresses={findAddresses}
        createAddress={createAddress}
        removeAddress={removeAddress}
        onOpenEdit={handleOpenEdit}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeletingId(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />

    </div>
  );
}
