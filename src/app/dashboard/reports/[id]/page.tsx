'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, User, Tag, MessageSquare, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axiosInstance';
import { useAuthStore } from '@/store/authStore';
import StatusBadge from '@/components/StatusBadge';
import toast from 'react-hot-toast';

interface Report {
  id: number;
  header: string;
  body: string;
  image: string | null;
  status: 'pending' | 'approved' | 'rejected';
  pelapor: string;
  kategori: string;
  created_at: string;
  total_komentar: number;
}

interface Comment {
  id: number;
  body: string;
  username: string;
  created_at: string;
  user_id: number;
}

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchReport();
    fetchComments();
  }, [id]);

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
    } catch {
      // Comments might not exist yet
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSending(true);
    try {
      await api.post('/comments', {
        body: newComment,
        public_report_id: parseInt(id),
      });
      toast.success('Komentar berhasil ditambahkan');
      setNewComment('');
      fetchComments();
    } catch {
      toast.error('Gagal menambahkan komentar');
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.delete(`/comments/${commentId}`);
      toast.success('Komentar berhasil dihapus');
      fetchComments();
    } catch {
      toast.error('Gagal menghapus komentar');
    }
  };

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

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-emerald-600 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Laporan
      </Link>

      {/* Report Detail */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6"
      >
        {report.image && (
          <img
            src={`http://localhost:8000${report.image}`}
            alt={report.header}
            className="w-full h-64 object-cover"
          />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl font-bold text-slate-900">
              {report.header}
            </h1>
            <StatusBadge status={report.status} />
          </div>

          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mb-6">
            {report.body}
          </p>

          <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-4 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              {report.pelapor}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              {report.kategori}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(report.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              {report.total_komentar} komentar
            </span>
          </div>
        </div>
      </motion.div>

      {/* Comments Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6"
      >
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-500" />
          Komentar
        </h2>

        {/* Comment List */}
        {comments.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">
            Belum ada komentar. Jadilah yang pertama!
          </p>
        ) : (
          <div className="space-y-4 mb-6">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="flex gap-3 p-3 rounded-xl bg-slate-50"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {comment.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {comment.username}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {new Date(comment.created_at).toLocaleDateString(
                          'id-ID'
                        )}
                      </span>
                      {user && user.id === comment.user_id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{comment.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Comment Form */}
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
    </div>
  );
}
