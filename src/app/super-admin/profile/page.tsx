'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Lock, Mail, Calendar, Shield } from 'lucide-react';
import api from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function SuperAdminProfilePage() {
  const { user, token, setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [joinedDate, setJoinedDate] = useState<string | null>(null);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      const d = res.data.data;
      setUsername(d.username);
      setEmail(d.email || '');
      if (d.created_at) setJoinedDate(d.created_at);
    } catch {
      toast.error('Gagal memuat profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) { toast.error('Username tidak boleh kosong'); return; }
    if (!email.trim()) { toast.error('Email tidak boleh kosong'); return; }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) { toast.error('Format email tidak valid'); return; }

    if (password && password !== confirmPassword) { toast.error('Konfirmasi password tidak cocok'); return; }
    if (password && password.length < 6) { toast.error('Password minimal 6 karakter'); return; }

    setIsSaving(true);
    try {
      const payload: { username: string; email: string; password?: string } = { username, email };
      if (password) payload.password = password;

      const res = await api.put('/auth/profile', payload);
      const updated = res.data.data;

      if (user && token) {
        setAuth({ ...user, username: updated.username }, token);
      }

      toast.success('Profil berhasil diperbarui');
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Profil Saya</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola informasi akun super admin Anda</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
      >
        {/* Banner – warna berbeda dari admin biasa */}
        <div className="relative h-32 bg-gradient-to-br from-violet-600 to-purple-600">
          <div className="absolute -bottom-10 left-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-white p-1.5 shadow-md">
              <div className="flex items-center justify-center w-full h-full rounded-full bg-violet-100">
                <User className="w-8 h-8 text-violet-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-14 px-6 pb-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-100">
            {joinedDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Bergabung sejak {new Date(joinedDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-violet-500" />
              <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-xs font-semibold tracking-wide border border-violet-200">
                Super Admin
              </span>
            </span>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="superadmin-profile-username" className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="superadmin-profile-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="superadmin-profile-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="superadmin-profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-violet-500" />
                Ubah Password (Opsional)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="superadmin-profile-password" className="block text-sm font-medium text-slate-700 mb-1.5">Password Baru</label>
                  <input
                    id="superadmin-profile-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                </div>
                <div>
                  <label htmlFor="superadmin-profile-confirm-password" className="block text-sm font-medium text-slate-700 mb-1.5">Konfirmasi Password</label>
                  <input
                    id="superadmin-profile-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50"
              >
                {isSaving
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Save className="w-4 h-4" />}
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
