'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar, { MenuItem } from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { LayoutDashboard, Users, ClipboardList, Tag } from 'lucide-react';

const superAdminMenuItems: MenuItem[] = [
  { href: '/super-admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: '/super-admin/users', label: 'Kelola User', icon: <Users className="w-5 h-5" /> },
  { href: '/super-admin/reports', label: 'Kelola Laporan', icon: <ClipboardList className="w-5 h-5" /> },
  { href: '/super-admin/categories', label: 'Kelola Kategori', icon: <Tag className="w-5 h-5" /> },
];

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, user, loadFromCookie } = useAuthStore();
  const router = useRouter();

  useEffect(() => { loadFromCookie(); }, [loadFromCookie]);

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return; }
    if (user && user.role !== 'super_admin') { router.replace('/dashboard'); }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || (user && user.role !== 'super_admin')) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar menuItems={superAdminMenuItems} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
