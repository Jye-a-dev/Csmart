'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useUsers } from '@/hooks';
import type { User } from '@/types/entities/user';
import {
  Layers,
  Sparkles,
  Package,
  MapPin,
  Gift,
  Bot,
  Headphones,
  LogOut,
  X,
  Store,
  CreditCard,
  Flame,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
  badge?: string;
  highlight?: boolean;
}

interface SidebarNavGroup {
  label: string;
  items: SidebarNavItem[];
}

interface UserSidebarProps {
  user: User | null;
  mobileOpen: boolean;
  onClose: () => void;
}

export default function UserSidebar({ user, mobileOpen, onClose }: UserSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { getUserStats } = useUsers();

  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState<{
    points: number;
    total_orders: number;
    total_spent: number;
    membership_tier: string;
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch real points and order stats from database
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    getUserStats(user.id)
      .then((data) => {
        if (isMounted && data) {
          setStats(data);
        }
      })
      .catch(() => {
        // Fallback default if new user with 0 orders
        if (isMounted) {
          setStats({
            points: 50,
            total_orders: 0,
            total_spent: 0,
            membership_tier: 'THÀNH VIÊN ĐỒNG',
          });
        }
      })
      .finally(() => {
        if (isMounted) setLoadingStats(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user?.id, getUserStats]);

  const handleLogout = async () => {
    await logout();
    window.dispatchEvent(new Event('auth-change'));
    window.location.href = '/login';
  };

  const navGroups: SidebarNavGroup[] = [
    {
      label: 'MUA SẮM & KHÁM PHÁ',
      items: [
        { name: 'Cửa Hàng Trực Tuyến', href: '/user', icon: Store, exact: true },
        { name: 'Danh Mục Ngành Hàng', href: '/user/categories', icon: Layers },
        { name: 'Sản Phẩm Bán Chạy', href: '/user#featured-products', icon: Flame, badge: 'HOT' },
      ],
    },
    {
      label: 'TÀI KHOẢN & ĐƠN HÀNG',
      items: [
        { name: 'Đơn Hàng Của Tôi', href: '/user#featured-products', icon: Package },
        { name: 'Sổ Địa Chỉ Nhận Hàng', href: '/user#featured-products', icon: MapPin },
        { name: 'Kho Voucher & Ưu Đãi', href: '/user#featured-products', icon: Gift, badge: '50k' },
        { name: 'Thẻ & Phương Thức TT', href: '/user#featured-products', icon: CreditCard },
      ],
    },
    {
      label: 'HỖ TRỢ & TRỢ LÝ AI',
      items: [
        { name: 'Trợ Lý AI Copilot 24/7', href: '/user#chat', icon: Bot, highlight: true },
        { name: 'Tổng Đài CSKH 1900 1000', href: 'tel:19001000', icon: Headphones },
      ],
    },
  ];

  const currentPoints = stats?.points ?? 50;
  const currentTier = stats?.membership_tier ?? (user?.role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'THÀNH VIÊN CSMART');

  // Render desktop & drawer content
  const renderContent = (isDrawer = false) => {
    const isIconOnly = !isDrawer && collapsed;

    return (
      <div className="flex flex-col justify-between h-full bg-white text-zinc-900 font-sans select-none">
        <div className="overflow-y-auto overflow-x-hidden flex-1 py-1">
          {/* Header Bar */}
          <div
            className={`flex items-center border-b border-zinc-200 py-4 transition-all ${
              isIconOnly ? 'justify-center px-2' : 'justify-between px-5'
            }`}
          >
            <Link href="/user" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-linear-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center font-black text-lg rounded-2xl shadow-sm shadow-orange-600/30 group-hover:rotate-6 transition-transform shrink-0">
                CS
              </div>
              {!isIconOnly && (
                <div>
                  <span className="text-lg font-black tracking-tight text-zinc-900 block leading-none">
                    CSMART
                  </span>
                  <span className="text-[10px] font-bold text-orange-600 tracking-widest uppercase mt-0.5 block">
                    User Portal
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Collapse / Expand Toggle Button */}
            {!isDrawer && (
              <button
                type="button"
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:flex p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
              >
                {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
            )}

            {/* Mobile Close Button */}
            {isDrawer && (
              <button
                type="button"
                onClick={onClose}
                className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                title="Đóng menu"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* User Profile Card */}
          <div
            className={`mx-3 my-3 rounded-2xl bg-linear-to-br from-orange-50/80 via-white to-amber-50/50 border border-orange-200/60 shadow-xs transition-all ${
              isIconOnly ? 'p-2 flex flex-col items-center justify-center text-center' : 'p-3.5'
            }`}
          >
            <div className={`flex items-center ${isIconOnly ? 'justify-center' : 'gap-3'}`}>
              <div
                className="w-10 h-10 rounded-2xl bg-orange-600 text-white font-black text-sm flex items-center justify-center shadow-sm shrink-0"
                title={user?.full_name || 'Khách Hàng'}
              >
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>

              {!isIconOnly && (
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-black text-zinc-900 block truncate">
                    {user?.full_name || 'Khách Hàng Thành Viên'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-600/10 text-orange-700 text-[10px] font-bold uppercase tracking-wider truncate">
                      <Sparkles size={10} className="text-orange-600 shrink-0" />
                      <span className="truncate">{currentTier}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Real Points Calculation */}
            {!isIconOnly ? (
              <div className="mt-3 pt-2 border-t border-orange-100/80 flex items-center justify-between text-[11px] font-medium text-zinc-500">
                <span>Điểm tích lũy:</span>
                <span className="font-extrabold text-orange-600">
                  {loadingStats ? (
                    <span className="animate-pulse">Đang tải...</span>
                  ) : (
                    `${currentPoints.toLocaleString('vi-VN')} CSMART Pts`
                  )}
                </span>
              </div>
            ) : (
              <div
                className="mt-1.5 text-[9px] font-black text-orange-600 bg-orange-100/80 px-1 py-0.5 rounded-md text-center"
                title={`Điểm tích lũy: ${currentPoints.toLocaleString('vi-VN')} Pts`}
              >
                {currentPoints}P
              </div>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="px-2.5 py-1 space-y-4">
            {navGroups.map((group) => (
              <div key={group.label}>
                {!isIconOnly && (
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2.5 mb-1">
                    {group.label}
                  </p>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.exact
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={onClose}
                        title={isIconOnly ? item.name : undefined}
                        className={`flex items-center rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                          isIconOnly ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                        } ${
                          item.highlight
                            ? 'bg-orange-50/80 text-orange-700 border border-orange-200/80 hover:bg-orange-100'
                            : isActive
                            ? 'bg-orange-600 text-white shadow-xs'
                            : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                        }`}
                      >
                        <div className={`flex items-center ${isIconOnly ? 'justify-center' : 'gap-3'}`}>
                          <Icon
                            size={17}
                            className={`shrink-0 ${
                              item.highlight
                                ? 'text-orange-600'
                                : isActive
                                ? 'text-white'
                                : 'text-zinc-400 group-hover:text-zinc-700'
                            }`}
                          />
                          {!isIconOnly && <span className="truncate">{item.name}</span>}
                        </div>

                        {!isIconOnly && item.badge && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              isActive ? 'bg-white text-orange-600' : 'bg-orange-600 text-white'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Profile & Logout Footer */}
        <div className={`p-3 border-t border-zinc-200 bg-zinc-50/60 ${isIconOnly ? 'flex justify-center' : ''}`}>
          <button
            type="button"
            onClick={handleLogout}
            title="Đăng xuất tài khoản"
            className={`flex items-center justify-center rounded-xl bg-white hover:bg-rose-50 text-zinc-700 hover:text-rose-600 text-xs font-bold border border-zinc-200 hover:border-rose-200 shadow-2xs active:scale-[0.98] transition-all cursor-pointer ${
              isIconOnly ? 'p-2.5 w-10 h-10' : 'w-full gap-2 px-4 py-2.5'
            }`}
          >
            <LogOut size={15} className="shrink-0" />
            {!isIconOnly && <span>Đăng Xuất</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-zinc-200 bg-white sticky top-0 h-screen transition-all duration-300 z-30 ${
          collapsed ? 'w-20' : 'w-72'
        }`}
      >
        {renderContent(false)}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={onClose}
          />

          <div className="relative w-80 max-w-[85vw] h-full bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200 flex flex-col">
            {renderContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
