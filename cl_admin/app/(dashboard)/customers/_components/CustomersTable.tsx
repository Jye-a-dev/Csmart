'use client';

import { Search, Eye, Edit3, Trash2, Shield, User as UserIcon, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import { User } from '@/types/entities/user';

interface CustomersTableProps {
  users: User[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  roleFilter: string;
  setRoleFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  onViewDetails: (user: User) => void;
  onOpenEdit: (user: User) => void;
  onToggleActive: (user: User) => void;
  onDelete: (id: string) => void;
}

export default function CustomersTable({
  users,
  loading,
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  onViewDetails,
  onOpenEdit,
  onToggleActive,
  onDelete,
}: CustomersTableProps) {
  
  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border-2 border-[#09090B] bg-purple-100 text-purple-900 font-mono text-[10px] font-black uppercase">
            <ShieldAlert size={12} className="text-purple-600" />
            ADMIN
          </span>
        );
      case 'SUPPORT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border-2 border-[#09090B] bg-blue-100 text-blue-900 font-mono text-[10px] font-black uppercase">
            <Shield size={12} className="text-blue-600" />
            SUPPORT
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 border-2 border-[#09090B] bg-zinc-100 text-zinc-800 font-mono text-[10px] font-bold uppercase">
            <UserIcon size={12} className="text-zinc-500" />
            CUSTOMER
          </span>
        );
    }
  };

  return (
    <div className="border-4 border-[#09090B] bg-white shadow-[6px_6px_0px_0px_#09090B]">
      
      {/* Search & Filter Toolbar */}
      <div className="p-6 border-b-4 border-[#09090B] bg-[#FAFAFA] flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, email, SĐT hoặc UUID..."
            className="w-full pl-10 pr-4 py-2.5 border-2 border-[#09090B] focus:outline-none focus:bg-white font-mono text-xs font-bold bg-white shadow-[2px_2px_0px_0px_#09090B]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center border-2 border-[#09090B] bg-white p-1 shadow-[2px_2px_0px_0px_#09090B]">
            <span className="font-mono text-[10px] font-bold text-zinc-400 px-2 uppercase">Vai trò:</span>
            {['ALL', 'CUSTOMER', 'SUPPORT', 'ADMIN'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2.5 py-1 font-mono text-[11px] font-extrabold uppercase border transition-all ${
                  roleFilter === r
                    ? 'bg-[#09090B] text-white border-[#09090B]'
                    : 'bg-transparent text-[#09090B] border-transparent hover:bg-zinc-100'
                }`}
              >
                {r === 'ALL' ? 'Tất cả' : r}
              </button>
            ))}
          </div>

          {/* Active Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border-2 border-[#09090B] bg-white px-3 py-2 font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#09090B] focus:outline-none cursor-pointer"
          >
            <option value="ALL">Trạng thái: Tất cả</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="INACTIVE">Vô hiệu hóa</option>
          </select>
        </div>

      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-sans">
          <thead>
            <tr className="border-b-4 border-[#09090B] bg-zinc-100 font-mono text-xs uppercase font-black text-[#09090B]">
              <th className="p-4 border-r-2 border-[#09090B]">Khách Hàng</th>
              <th className="p-4 border-r-2 border-[#09090B]">Liên Hệ</th>
              <th className="p-4 border-r-2 border-[#09090B]">Vai Trò</th>
              <th className="p-4 border-r-2 border-[#09090B]">Trạng Thái</th>
              <th className="p-4 border-r-2 border-[#09090B]">Ngày Tạo</th>
              <th className="p-4 text-center">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[#09090B] font-mono text-xs font-bold">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-zinc-500 bg-white">
                  <div className="inline-flex items-center gap-2 font-mono font-bold animate-pulse">
                    Đang tải danh sách người dùng...
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-zinc-500 bg-white">
                  Không tìm thấy người dùng nào phù hợp.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-amber-50/50 transition-colors">
                  
                  {/* Avatar & Name */}
                  <td className="p-4 border-r-2 border-[#09090B]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 border-2 border-[#09090B] bg-[#F97316] text-white flex items-center justify-center font-mono font-black text-sm shadow-[2px_2px_0px_0px_#09090B]">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <span className="font-extrabold text-[#09090B] block text-sm">{user.full_name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">ID: {String(user.uuid || user.id || '').slice(0, 8)}...</span>
                      </div>
                    </div>
                  </td>

                  {/* Email & Phone */}
                  <td className="p-4 border-r-2 border-[#09090B]">
                    <div className="space-y-0.5">
                      <div className="text-[#09090B] font-bold">{user.email}</div>
                      <div className="text-zinc-500 text-[11px]">{user.phone || 'Chưa cập nhật SĐT'}</div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="p-4 border-r-2 border-[#09090B]">
                    {getRoleBadge(user.role)}
                  </td>

                  {/* Status Toggle */}
                  <td className="p-4 border-r-2 border-[#09090B]">
                    <button
                      onClick={() => onToggleActive(user)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 border-2 border-[#09090B] text-[10px] font-black uppercase cursor-pointer transition-all shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 ${
                        user.is_active
                          ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-900 hover:bg-rose-200'
                      }`}
                      title="Bấm để thay đổi trạng thái hoạt động"
                    >
                      {user.is_active ? (
                        <>
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          Hoạt động
                        </>
                      ) : (
                        <>
                          <XCircle size={12} className="text-rose-600" />
                          Vô hiệu hóa
                        </>
                      )}
                    </button>
                  </td>

                  {/* Created At */}
                  <td className="p-4 border-r-2 border-[#09090B] text-zinc-600 text-[11px]">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>

                  {/* Action Buttons */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => onViewDetails(user)}
                        className="p-2 border-2 border-[#09090B] bg-white hover:bg-zinc-100 text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                        title="Xem chi tiết"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        onClick={() => onOpenEdit(user)}
                        className="p-2 border-2 border-[#09090B] bg-amber-100 hover:bg-amber-200 text-[#09090B] shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => onDelete(user.id)}
                        className="p-2 border-2 border-[#09090B] bg-rose-100 hover:bg-rose-200 text-rose-900 shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
                        title="Xóa khách hàng"
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
  );
}
