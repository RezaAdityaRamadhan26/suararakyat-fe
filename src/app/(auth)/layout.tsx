'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, loadFromCookie } = useAuthStore();

  useEffect(() => {
    loadFromCookie();
  }, [loadFromCookie]);

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'super_admin':
          router.replace('/super-admin');
          break;
        case 'admin':
          router.replace('/admin');
          break;
        default:
          router.replace('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  return <>{children}</>;
}
