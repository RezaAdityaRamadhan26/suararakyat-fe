'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Sidebar, { MenuItem } from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import { FileText, PlusCircle, User } from 'lucide-react';

const userMenuItems: MenuItem[] = [
  {
    href: '/dashboard',
    label: 'Daftar Laporan',
    icon: <FileText className="w-5 h-5" />,
  },
  {
    href: '/dashboard/create',
    label: 'Buat Laporan',
    icon: <PlusCircle className="w-5 h-5" />,
  },
  {
    href: '/dashboard/profile',
    label: 'Profil Saya',
    icon: <User className="w-5 h-5" />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isInitialized, loadFromCookie } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    loadFromCookie();
  }, [loadFromCookie]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        menuItems={userMenuItems}
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
