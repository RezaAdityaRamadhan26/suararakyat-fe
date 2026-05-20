'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Search, UserPlus } from 'lucide-react';
import api from '@/lib/axiosInstance';
import RoleBadge from '@/components/RoleBadge';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
}

export default function SuperAdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<string>('user');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try { const res = await api.get('/users'); setUsers(res.data.data); }
    catch { toast.error('Gagal memuat data user'); }
    finally { setIsLoading(false); }
  };

  const openAddModal = () => {
    setModalMode('add'); setFormUsername(''); setFormEmail(''); setFormPassword(''); setFormRole('user'); setEditUserId(null); setModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setModalMode('edit'); setFormUsername(u.username); setFormEmail(u.email || ''); setFormPassword(''); setFormRole(u.role); setEditUserId(u.id); setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formUsername.trim()) { toast.error('Username wajib diisi'); return; }
    if (!formEmail.trim()) { toast.error('Email wajib diisi'); return; }
    if (modalMode === 'add' && !formPassword.trim()) { toast.error('Password wajib diisi'); return; }
    setIsSaving(true);
    try {
      if (modalMode === 'add') {
        await api.post('/users', { username: formUsername, email: formEmail, password: formPassword, role: formRole });
        toast.success('User berhasil ditambahkan');
      } else {
        const payload: { username: string; email: string; role: string; password?: string } = { username: formUsername, email: formEmail, role: formRole };
        if (formPassword.trim()) payload.password = formPassword;
        await api.put(`/users/${editUserId}`, payload);
        toast.success('User berhasil diperbarui');
      }
      setModalOpen(false); fetchUsers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal menyimpan user');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try { await api.delete(`/users/${deleteId}`); toast.success('User berhasil dihapus'); fetchUsers(); }
    catch { toast.error('Gagal menghapus user'); }
    finally { setIsDeleting(false); setDeleteId(null); }
  };

  const filteredUsers = users.filter((u) => u.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola User</h1>
          <p className="text-sm text-slate-500 mt-1">Tambah, edit, atau hapus akun pengguna</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
          <UserPlus className="w-4 h-4" /> Tambah User
        </button>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari username..."
          className="w-full max-w-md pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : filteredUsers.length === 0 ? (
        <EmptyState title="Tidak ada user" message="Belum ada user yang terdaftar." />
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Username</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{u.username.charAt(0).toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-slate-800">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEditModal(u)} className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteId(u.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
              <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>
              <h3 className="text-lg font-bold text-slate-900 mb-5">{modalMode === 'add' ? 'Tambah User Baru' : 'Edit User'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                  <input type="text" value={formUsername} onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Password {modalMode === 'edit' && <span className="text-slate-400 font-normal">(kosongkan jika tidak diubah)</span>}</label>
                  <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} placeholder={modalMode === 'edit' ? '••••••••' : ''}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 justify-end mt-6">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Batal</button>
                <button onClick={handleSave} disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50">
                  {isSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog isOpen={deleteId !== null} title="Hapus User" message="Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={isDeleting} />
    </div>
  );
}
