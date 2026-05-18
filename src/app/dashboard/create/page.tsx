'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Upload, X, Send, ImageIcon } from 'lucide-react';
import api from '@/lib/axiosInstance';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  category_name: string;
}

export default function CreateReportPage() {
  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data);
    } catch {
      toast.error('Gagal memuat kategori');
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran gambar maksimal 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!header.trim() || !body.trim() || !categoryId) {
      toast.error('Judul, isi laporan, dan kategori wajib diisi');
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('header', header);
      formData.append('body', body);
      formData.append('category_id', categoryId);
      if (image) {
        formData.append('image', image);
      }

      await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Laporan berhasil dibuat!');
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || 'Gagal membuat laporan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-slate-900">Buat Laporan Baru</h1>
        <p className="text-sm text-slate-500 mt-1">
          Sampaikan pengaduan atau aspirasi Anda
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5"
      >
        {/* Judul */}
        <div>
          <label
            htmlFor="report-header"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Judul Laporan
          </label>
          <input
            id="report-header"
            type="text"
            value={header}
            onChange={(e) => setHeader(e.target.value)}
            placeholder="Tulis judul laporan yang singkat dan jelas"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Kategori */}
        <div>
          <label
            htmlFor="report-category"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Kategori
          </label>
          <select
            id="report-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
          >
            <option value="">Pilih kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Body */}
        <div>
          <label
            htmlFor="report-body"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Isi Laporan
          </label>
          <textarea
            id="report-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Jelaskan pengaduan Anda secara detail..."
            rows={6}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Lampiran Gambar (opsional)
          </label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="report-image"
              className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 hover:border-emerald-300 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 mb-3">
                <ImageIcon className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-slate-600">
                Klik untuk upload gambar
              </p>
              <p className="text-xs text-slate-400 mt-1">
                PNG, JPG hingga 5MB
              </p>
              <input
                id="report-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-200 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-4 h-4" />
              Kirim Laporan
            </>
          )}
        </button>
      </motion.form>
    </div>
  );
}
