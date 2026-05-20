'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar, { MenuItem } from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { ClipboardList, Tag, User } from 'lucide-react';

const adminMenuItems: MenuItem[] = [
  {
    href: '/admin',
    label: 'Kelola Laporan',
    icon: <ClipboardList className="w-5 h-5" />,
  },
  {
    href: '/admin/categories',
    label: 'Kelola Kategori',
    icon: <Tag className="w-5 h-5" />,
  },
  {
    href: '/admin/profile',
    label: 'Profil Saya',
    icon: <User className="w-5 h-5" />,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isInitialized, user, loadFromCookie } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadFromCookie();
  }, [loadFromCookie]);

  useEffect(() => {
    if (isInitialized) {
      if (!isAuthenticated) {
        router.replace('/login');
        return;
      }
      if (user && user.role !== 'admin' && user.role !== 'super_admin') {
        router.replace('/dashboard');
      }
    }
  }, [isInitialized, isAuthenticated, user, router]);

  if (!isInitialized || !isAuthenticated || (user && user.role !== 'admin' && user.role !== 'super_admin')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        menuItems={adminMenuItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:pl-64">
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
