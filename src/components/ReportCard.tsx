'use client';

import { motion } from 'framer-motion';
import StatusBadge from './StatusBadge';
import { Calendar, User, Tag } from 'lucide-react';
import Link from 'next/link';

interface ReportCardProps {
  id: number;
  header: string;
  body: string;
  image: string | null;
  status: 'pending' | 'approved' | 'rejected';
  pelapor: string;
  kategori: string;
  created_at: string;
  index: number;
  linkPrefix: string;
}

export default function ReportCard({
  id,
  header,
  body,
  image,
  status,
  pelapor,
  kategori,
  created_at,
  index,
  linkPrefix,
}: ReportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Link href={`${linkPrefix}/${id}`}>
        <div className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all duration-300 overflow-hidden cursor-pointer">
          {/* Image */}
          {image && (
            <div className="relative h-44 overflow-hidden">
              <img
                src={`http://localhost:8000${image}`}
                alt={header}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3">
                <StatusBadge status={status} />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-5">
            {!image && (
              <div className="mb-3">
                <StatusBadge status={status} />
              </div>
            )}
            <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-200">
              {header}
            </h3>
            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4">
              {body}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {pelapor}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                {kategori}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
