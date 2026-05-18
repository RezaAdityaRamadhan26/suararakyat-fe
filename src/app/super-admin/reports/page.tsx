'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Eye, Trash2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axiosInstance';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmptyState from '@/components/EmptyState';
import toast from 'react-hot-toast';

interface Report {
  id: number; header: string; body: string; image: string | null;
  status: 'pending' | 'approved' | 'rejected'; pelapor: string; kategori: string; created_at: string;
}

export default function SuperAdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try { const res = await api.get('/reports'); setReports(res.data.data); }
    catch { toast.error('Gagal memuat laporan'); }
    finally { setIsLoading(false); }
  };

  const handleStatusChange = async (id: number, s: string) => {
    try { await api.put(`/reports/${id}/status`, { status: s }); toast.success('Status diperbarui'); fetchReports(); }
    catch { toast.error('Gagal memperbarui status'); }
  };

  const handleDelete = async () => {
    if (!deleteId) return; setIsDeleting(true);
    try { await api.delete(`/reports/${deleteId}`); toast.success('Laporan dihapus'); fetchReports(); }
    catch { toast.error('Gagal menghapus laporan'); }
    finally { setIsDeleting(false); setDeleteId(null); }
  };

  const filtered = reports.filter((r) => {
    const ms = r.header.toLowerCase().includes(search.toLowerCase()) || r.pelapor.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === 'all' || r.status === statusFilter;
    return ms && mf;
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Kelola Laporan</h1>
        <p className="text-sm text-slate-500 mt-1">Tinjau dan kelola semua laporan masyarakat</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari laporan..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
        </div>
        <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
          {([['all','Semua'],['pending','Pending'],['approved','Approved'],['rejected','Rejected']] as const).map(([k,l]) => (
            <button key={k} onClick={() => setStatusFilter(k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter===k?'bg-emerald-500 text-white shadow-sm':'text-slate-500 hover:bg-slate-50'}`}>{l}</button>
          ))}
        </div>
      </div>

      {isLoading ? <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      : filtered.length === 0 ? <EmptyState title="Tidak ada laporan" message="Tidak ada laporan yang sesuai filter." />
      : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Laporan</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Pelapor</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Kategori</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Tanggal</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4"><p className="text-sm font-semibold text-slate-800 line-clamp-1">{r.header}</p><p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{r.body}</p></td>
                    <td className="px-5 py-4 hidden sm:table-cell"><span className="text-sm text-slate-600">{r.pelapor}</span></td>
                    <td className="px-5 py-4 hidden md:table-cell"><span className="text-sm text-slate-600">{r.kategori}</span></td>
                    <td className="px-5 py-4">
                      <div className="relative inline-block">
                        <select value={r.status} onChange={(e) => handleStatusChange(r.id, e.target.value)}
                          className={`appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-full border cursor-pointer focus:outline-none ${r.status==='pending'?'bg-amber-50 text-amber-700 border-amber-200':r.status==='approved'?'bg-emerald-50 text-emerald-700 border-emerald-200':'bg-red-50 text-red-700 border-red-200'}`}>
                          <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell"><span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}</span></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/super-admin/reports/${r.id}`} className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => setDeleteId(r.id)} className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      <ConfirmDialog isOpen={deleteId!==null} title="Hapus Laporan" message="Apakah Anda yakin ingin menghapus laporan ini?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={isDeleting} />
    </div>
  );
}
