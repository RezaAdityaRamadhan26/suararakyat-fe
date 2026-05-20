'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Check, Tag } from 'lucide-react';
import api from '@/lib/axiosInstance';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import toast from 'react-hot-toast';

interface Category { id: number; category_name: string; }

export default function SACategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try { const r = await api.get('/categories'); setCategories(r.data.data); }
    catch { toast.error('Gagal memuat kategori'); }
    finally { setIsLoading(false); }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      toast.error('Silakan masukkan nama kategori terlebih dahulu');
      return;
    }
    setIsAdding(true);
    try { await api.post('/categories', { category_name: newName }); toast.success('Kategori ditambahkan'); setNewName(''); fetchCategories(); }
    catch { toast.error('Gagal menambahkan kategori'); }
    finally { setIsAdding(false); }
  };

  const handleUpdate = async (id: number) => {
    if (!editName.trim()) return;
    try { await api.put(`/categories/${id}`, { category_name: editName }); toast.success('Kategori diperbarui'); setEditId(null); fetchCategories(); }
    catch { toast.error('Gagal memperbarui kategori'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return; setIsDeleting(true);
    try { await api.delete(`/categories/${deleteId}`); toast.success('Kategori dihapus'); fetchCategories(); }
    catch { toast.error('Gagal menghapus'); }
    finally { setIsDeleting(false); setDeleteId(null); }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kelola Kategori</h1>
        <p className="text-sm text-slate-500 mt-1">Tambah, edit, atau hapus kategori laporan</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex gap-3">
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nama kategori baru..." onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          <button onClick={handleAdd} disabled={isAdding} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50">
            <Plus className="w-4 h-4" />Tambah
          </button>
        </div>
      </motion.div>

      {isLoading ? <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      : categories.length === 0 ? <EmptyState title="Belum ada kategori" message="Tambahkan kategori pertama." icon={<Tag className="w-8 h-8 text-slate-400" />} />
      : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-50">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/50 transition-colors">
                {editId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-4">
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" autoFocus />
                    <button onClick={() => handleUpdate(cat.id)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"><Check className="w-4 h-4" /></button>
                    <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50"><Tag className="w-4 h-4 text-emerald-600" /></div>
                      <span className="text-sm font-medium text-slate-800">{cat.category_name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditId(cat.id); setEditName(cat.category_name); }} className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(cat.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
      <ConfirmDialog isOpen={deleteId!==null} title="Hapus Kategori" message="Yakin ingin menghapus kategori ini?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={isDeleting} />
    </div>
  );
}
