'use client';

import { create } from 'zustand';
import Cookies from 'js-cookie';

interface User {
  id: number;
  username: string;
  role: 'user' | 'admin' | 'super_admin';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loadFromCookie: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setAuth: (user: User, token: string) => {
    Cookies.set('token', token, { expires: 1 });
    Cookies.set('user', JSON.stringify(user), { expires: 1 });
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadFromCookie: () => {
    const token = Cookies.get('token');
    const userStr = Cookies.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isAuthenticated: true });
      } catch {
        Cookies.remove('token');
        Cookies.remove('user');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },
}));
