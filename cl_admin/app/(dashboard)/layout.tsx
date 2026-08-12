'use client';

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AuthGuard from '@/components/guards/AuthGuard';
import { useAuth } from '@/hooks';
import { formatTimeString } from '@/utils/time';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Settings,
  LogOut,
  Search,
  ShieldCheck,
  Terminal,
  Menu,
  X,
  Bot,
  ScrollText,
  FlaskConical,
  DatabaseZap,
  CreditCard,
  FolderTree,
  HelpCircle,
} from 'lucide-react';
type DashboardLayoutProps = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { getCurrentUser, logout } = useAuth();
  const [time, setTime] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const user = getCurrentUser();

  // Đồng hồ hiển thị thời gian thực
  useEffect(() => {
    const updateTime = () => {
      setTime(formatTimeString(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const navGroups = [
    {
      label: 'NGHIỆP VỤ',
      items: [
        { name: 'Tổng Quan', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Đơn Hàng', href: '/orders', icon: ShoppingBag },
        { name: 'Sản Phẩm', href: '/products', icon: Package },
        { name: 'Danh Mục', href: '/categories', icon: FolderTree },
        { name: 'Thanh Toán', href: '/payments', icon: CreditCard },
        { name: 'Khách Hàng', href: '/customers', icon: Users },
      ],
    },
    {
      label: 'AI & VẬN HÀNH',
      items: [
        { name: 'HITL Queue', href: '/hitl', icon: Bot },
        { name: 'AI Logs', href: '/ai-logs', icon: ScrollText },
        { name: 'AI Evaluator', href: '/ai-evaluator', icon: FlaskConical },
        { name: 'SQL Console', href: '/sql-console', icon: DatabaseZap },
      ],
    },
    {
      label: 'HỆ THỐNG',
      items: [
        { name: 'FAQs', href: '/faqs', icon: HelpCircle },
        { name: 'Cài Đặt', href: '/settings', icon: Settings },
      ],
    },
  ];
  // flat list for mobile (reuse same structure)
  const navItems = navGroups.flatMap((g) => g.items);

  return (
    <AuthGuard>
          <div className="flex min-h-screen w-full">
            
            {/* Desktop Left Sidebar */}
            <aside className="hidden lg:flex flex-col justify-between w-64 bg-white border-r-2 border-[#09090B] h-screen sticky top-0 z-30">
              <div>
                {/* Logo & Brand */}
                <div className="flex items-center gap-2 px-6 py-5 border-b-2 border-[#09090B]">
                  <div className="bg-[#09090B] text-[#FAFAFA] p-1.5 border border-[#09090B]">
                    <Terminal size={18} />
                  </div>
                  <span className="font-mono font-extrabold tracking-tighter text-lg uppercase text-[#09090B]">
                    CSMART<span className="text-[#F97316]">_Admin</span>
                  </span>
                </div>

                {/* Nav Menu */}
                <nav className="p-4 space-y-4 overflow-y-auto flex-1">
                  {navGroups.map((group) => (
                    <div key={group.label}>
                      <p className="font-mono text-[9px] font-black text-zinc-400 uppercase tracking-widest px-2 mb-1.5">{group.label}</p>
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                          return (
                            <a
                              key={item.name}
                              href={item.href}
                              className={`flex items-center gap-3 px-3 py-2.5 font-mono text-xs font-bold border-2 transition-all shadow-[2px_2px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 ${
                                isActive
                                  ? 'bg-[#F97316] text-white border-[#09090B]'
                                  : 'bg-white text-[#09090B] border-[#09090B] hover:bg-zinc-50'
                              }`}
                            >
                              <item.icon size={15} />
                              {item.name}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Admin Profile & Logout Block */}
              {user && (
                <div className="p-4 border-t-2 border-[#09090B] bg-[#FAFAFA]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] font-mono font-black flex items-center justify-center text-sm shadow-[2px_2px_0px_0px_#09090B]">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-mono text-xs font-black text-[#09090B] line-clamp-1">{user.full_name}</span>
                      <span className="font-mono text-[9px] text-[#F97316] uppercase tracking-wider font-black">{user.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full btn-brutal flex items-center justify-center gap-2 bg-[#FAFAFA] text-[#09090B] font-mono font-bold text-xs px-4 py-2.5 uppercase border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all hover:bg-zinc-100 cursor-pointer"
                  >
                    <LogOut size={14} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </aside>

            {/* Mobile Nav Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b-2 border-[#09090B] z-40 flex items-center justify-between px-6">
              <div className="flex items-center gap-2">
                <div className="bg-[#09090B] text-white p-1 border border-[#09090B]">
                  <Terminal size={16} />
                </div>
                <span className="font-mono font-black text-sm uppercase text-[#09090B]">
                  CSMART_Admin
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 border-2 border-[#09090B] bg-white text-[#09090B] shadow-[2px_2px_0px_0px_#09090B]"
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>

            {/* Mobile Menu Sidebar Drawer */}
            {mobileMenuOpen && (
              <div className="lg:hidden fixed inset-0 bg-[#09090B]/50 z-30 transition-opacity" onClick={() => setMobileMenuOpen(false)}>
                <aside className="w-64 bg-white h-full border-r-2 border-[#09090B] flex flex-col justify-between pt-20" onClick={(e) => e.stopPropagation()}>
                  <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 font-mono text-sm font-bold border-2 border-[#09090B] bg-white text-[#09090B] shadow-[2px_2px_0px_0px_#09090B]"
                      >
                        <item.icon size={18} />
                        {item.name}
                      </a>
                    ))}
                  </nav>
                  {user && (
                    <div className="p-4 border-t-2 border-[#09090B] bg-[#FAFAFA]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 border-2 border-[#09090B] bg-[#F97316] text-[#09090B] flex items-center justify-center text-sm shadow-[2px_2px_0px_0px_#09090B]">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs font-black text-[#09090B]">{user.full_name}</span>
                          <span className="font-mono text-[9px] text-[#F97316] uppercase tracking-wider font-black">{user.role}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 bg-[#FAFAFA] text-[#09090B] font-mono font-bold text-xs px-4 py-2.5 uppercase border-2 border-[#09090B] shadow-[3px_3px_0px_0px_#09090B]"
                      >
                        <LogOut size={14} />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </aside>
              </div>
            )}

            {/* Right side: Header & Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen w-full pt-16 lg:pt-0">
              
              {/* Header Bar */}
              <header className="h-20 bg-white border-b-2 border-[#09090B] px-6 lg:px-12 flex items-center justify-between sticky top-16 lg:top-0 z-20 shadow-[0_2px_0_0_#09090B]">
                {/* Search Bar */}
                <div className="relative max-w-md w-full hidden sm:block">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm đơn hàng, khách hàng..."
                    className="w-full pl-10 pr-4 py-2 border-2 border-[#09090B] focus:outline-none focus:bg-zinc-50 font-mono text-xs bg-white shadow-[2px_2px_0px_0px_#09090B]"
                  />
                </div>
                <div className="sm:hidden" />

                {/* System Status Indicators */}
                <div className="flex items-center gap-4">
                  <div className="hidden md:flex items-center gap-2 border-2 border-[#09090B] bg-[#FAFAFA] text-[#09090B] px-3 py-1 font-mono text-xs font-bold uppercase shadow-[2px_2px_0px_0px_#09090B]">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    HỆ THỐNG: HOẠT ĐỘNG
                  </div>
                  <div className="font-mono text-xs font-bold text-[#09090B] bg-zinc-100 px-3 py-1.5 border-2 border-[#09090B]">
                    {time}
                  </div>
                </div>
              </header>

              {/* Main Content Area */}
              <main className="flex-1 w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] p-6 lg:p-12">
                {children}
              </main>

            </div>

          </div>
        </AuthGuard>
  );
}
