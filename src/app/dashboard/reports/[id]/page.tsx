'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Calendar, User, Tag, MessageSquare, Send, Trash2,
  Pencil, Check, X, ImageIcon, AlertCircle, Clock, Info
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import StatusBadge from '@/components/StatusBadge';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  category_name: string;
}

interface Report {
  id: number;
  header: string;
  body: string;
  image: string | null;
  status: 'pending' | 'approved' | 'rejected';
  pelapor: string;
  kategori: string;
  kategori_id?: number;
  category_id?: number;
  created_at: string;
  total_komentar: number;
  user_id: number;
  edit_count: number;
}

interface Comment {
  id: number;
  body: string;
  username: string;
  created_at: string;
  user_id: number;
}

const MAX_EDIT_MINUTES = 5;
const MAX_EDIT_COUNT = 2;

export default function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuthStore();

  const [report, setReport] = useState<Report | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Comment edit state
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentBody, setEditingCommentBody] = useState('');
  const [isSavingComment, setIsSavingComment] = useState(false);

  // Report edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editHeader, setEditHeader] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [isSavingReport, setIsSavingReport] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => { fetchReport(); fetchComments(); fetchCategories(); }, [id]);

  const fetchReport = async () => {
    try {
      const res = await api.get(`/reports/${id}`);
      setReport(res.data.data);
    } catch {
      toast.error('Gagal memuat laporan');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/report/${id}`);
      setComments(res.data.data);
    } catch { /* Belum ada komentar */ }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch { /* ignore */ }
  };

  // ── Helpers ─────────────────────────────────────────────────
  const minutesSince = (dateStr: string) => (Date.now() - new Date(dateStr).getTime()) / 60000;

  const canEditComment = (comment: Comment) =>
    user && user.id === comment.user_id && minutesSince(comment.created_at) <= MAX_EDIT_MINUTES;

  const canEditReport = () => {
    if (!report || !user) return false;
    return (
      report.user_id === user.id &&
      report.status === 'pending' &&
      minutesSince(report.created_at) <= MAX_EDIT_MINUTES &&
      (report.edit_count ?? 0) < MAX_EDIT_COUNT
    );
  };

  const getEditReportBlockReason = () => {
    if (!report || !user) return null;
    if (report.user_id !== user.id) return null; // bukan miliknya, tidak perlu pesan
    if (report.status !== 'pending') return 'Laporan ini sudah tidak berstatus pending sehingga tidak dapat diedit.';
    if ((report.edit_count ?? 0) >= MAX_EDIT_COUNT) return `Laporan sudah mencapai batas maksimal edit (${MAX_EDIT_COUNT}x).`;
    if (minutesSince(report.created_at) > MAX_EDIT_MINUTES) return `Batas waktu edit (${MAX_EDIT_MINUTES} menit setelah dibuat) telah terlewat.`;
    return null;
  };

  // ── Comment CRUD ─────────────────────────────────────────────
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSending(true);
    try {
      await api.post('/comments', { body: newComment, public_report_id: parseInt(id) });
      toast.success('Komentar berhasil ditambahkan');
      setNewComment('');
      fetchComments();
    } catch { toast.error('Gagal menambahkan komentar'); }
    finally { setIsSending(false); }
  };

  const handleStartEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentBody(comment.body);
  };

  const handleSaveEditComment = async (commentId: number) => {
    if (!editingCommentBody.trim()) { toast.error('Komentar tidak boleh kosong'); return; }
    setIsSavingComment(true);
    try {
      await api.put(`/comments/${commentId}`, { body: editingCommentBody });
      toast.success('Komentar berhasil diperbarui');
      setEditingCommentId(null);
      fetchComments();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal memperbarui komentar');
    } finally { setIsSavingComment(false); }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`/comments/${commentId}`);
      toast.success('Komentar berhasil dihapus');
      fetchComments();
    } catch { toast.error('Gagal menghapus komentar'); }
  };

  // ── Report Edit ───────────────────────────────────────────────
  const handleOpenEditReport = () => {
    if (!report) return;
    const blockReason = getEditReportBlockReason();

    // Tampilkan toast info ketentuan edit, lalu buka modal jika bisa
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-white shadow-lg rounded-xl p-4 border border-slate-200 flex gap-3`}>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
          <Info className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800 mb-1">Ketentuan Edit Laporan</p>
          <ul className="text-xs text-slate-500 space-y-0.5 list-disc list-inside">
            <li>Hanya laporan berstatus <strong>pending</strong></li>
            <li>Maks. <strong>{MAX_EDIT_MINUTES} menit</strong> setelah dibuat</li>
            <li>Maks. <strong>{MAX_EDIT_COUNT}x</strong> edit ({MAX_EDIT_COUNT - (report.edit_count ?? 0)} sisa)</li>
          </ul>
          {blockReason && (
            <p className="text-xs text-red-500 font-medium mt-2 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />{blockReason}
            </p>
          )}
        </div>
        <button onClick={() => toast.dismiss(t.id)} className="flex-shrink-0 text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>
    ), { duration: 5000 });

    if (blockReason) return; // blokir jika tidak memenuhi syarat

    setEditHeader(report.header);
    setEditBody(report.body);
    setEditCategoryId(String(report.category_id ?? ''));
    setEditImage(null);
    setEditImagePreview(report.image ? `http://localhost:8000${report.image}` : null);
    setShowEditModal(true);
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error('Ukuran gambar maksimal 5MB'); return; }
      setEditImage(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveEditReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editHeader.trim() || !editBody.trim() || !editCategoryId) {
      toast.error('Judul, isi, dan kategori wajib diisi');
      return;
    }
    setIsSavingReport(true);
    try {
      const formData = new FormData();
      formData.append('header', editHeader);
      formData.append('body', editBody);
      formData.append('category_id', editCategoryId);
      if (editImage) formData.append('image', editImage);

      await api.put(`/reports/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Laporan berhasil diperbarui');
      setShowEditModal(false);
      fetchReport();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal memperbarui laporan');
    } finally { setIsSavingReport(false); }
  };

  // ── Render ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Laporan tidak ditemukan</p>
      </div>
    );
  }

  const isMyReport = user && user.id === report.user_id;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Laporan
      </Link>

      {/* Report Detail */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        {report.image && (
          <img src={`http://localhost:8000${report.image}`} alt={report.header} className="w-full h-64 object-cover" />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl font-bold text-slate-900">{report.header}</h1>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={report.status} />
              {isMyReport && (
                <button
                  onClick={handleOpenEditReport}
                  title="Edit laporan"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    canEditReport()
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-50 text-slate-400 border-slate-200 cursor-pointer'
                  }`}
                >
                  <Pencil className="w-3 h-3" />
                  Edit ({MAX_EDIT_COUNT - (report.edit_count ?? 0)}x sisa)
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mb-6">{report.body}</p>

          <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-4 border-t border-slate-100">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />{report.pelapor}</span>
            <span className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" />{report.kategori}</span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" />{report.total_komentar} komentar</span>
            {isMyReport && (report.edit_count ?? 0) > 0 && (
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Diedit {report.edit_count}x</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Comments Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-500" />
          Komentar
        </h2>

        {comments.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Belum ada komentar. Jadilah yang pertama!</p>
        ) : (
          <div className="space-y-3 mb-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-3 rounded-xl bg-slate-50">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{comment.username?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-slate-800">{comment.username}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400">
                        {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      {/* Edit Button – hanya owner dalam 5 menit */}
                      {canEditComment(comment) && editingCommentId !== comment.id && (
                        <button
                          onClick={() => handleStartEditComment(comment)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-600 transition-colors"
                          title="Edit komentar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {/* Delete – owner atau admin */}
                      {user && (user.id === comment.user_id || user.role !== 'user') && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                          title="Hapus komentar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline edit form */}
                  {editingCommentId === comment.id ? (
                    <div className="flex gap-2 mt-1">
                      <textarea
                        value={editingCommentBody}
                        onChange={(e) => setEditingCommentBody(e.target.value)}
                        rows={2}
                        className="flex-1 px-3 py-2 bg-white border border-emerald-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                        autoFocus
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleSaveEditComment(comment.id)}
                          disabled={isSavingComment}
                          className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                          title="Simpan"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingCommentId(null)}
                          className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg transition-colors"
                          title="Batal"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-600">{comment.body}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment */}
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Tulis komentar..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          <button
            type="submit"
            disabled={isSending || !newComment.trim()}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </motion.div>

      {/* Edit Report Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-emerald-500" />
                  Edit Laporan
                </h3>
                <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditReport} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {/* Sisa edit info */}
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Sisa edit: <strong>{MAX_EDIT_COUNT - (report.edit_count ?? 0)}x</strong> lagi</span>
                </div>

                <div>
                  <label htmlFor="edit-report-header" className="block text-sm font-medium text-slate-700 mb-1.5">Judul Laporan</label>
                  <input
                    id="edit-report-header"
                    type="text"
                    value={editHeader}
                    onChange={(e) => setEditHeader(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="edit-report-category" className="block text-sm font-medium text-slate-700 mb-1.5">Kategori</label>
                  <select
                    id="edit-report-category"
                    value={editCategoryId}
                    onChange={(e) => setEditCategoryId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-report-body" className="block text-sm font-medium text-slate-700 mb-1.5">Isi Laporan</label>
                  <textarea
                    id="edit-report-body"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                  />
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Gambar (opsional – kosongkan untuk tidak mengubah)</label>
                  {editImagePreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200">
                      <img src={editImagePreview} alt="Preview" className="w-full h-36 object-cover" />
                      <button
                        type="button"
                        onClick={() => { setEditImage(null); setEditImagePreview(null); }}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="edit-report-image" className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-emerald-300 transition-all cursor-pointer">
                      <ImageIcon className="w-6 h-6 text-emerald-400 mb-2" />
                      <span className="text-xs text-slate-500">Klik untuk unggah gambar baru</span>
                      <input id="edit-report-image" type="file" accept="image/*" onChange={handleEditImageChange} className="hidden" />
                    </label>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingReport}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {isSavingReport
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <><Check className="w-4 h-4" />Simpan</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
