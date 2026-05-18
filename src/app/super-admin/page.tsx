'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, Clock, CheckCircle } from 'lucide-react';
import api from '@/lib/axiosInstance';
import toast from 'react-hot-toast';

interface StatCard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

export default function SuperAdminDashboard() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [approvedReports, setApprovedReports] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, reportsRes] = await Promise.all([
        api.get('/users'),
        api.get('/reports'),
      ]);
      const users = usersRes.data.data;
      const reports = reportsRes.data.data;

      setTotalUsers(users.length);
      setTotalReports(reports.length);
      setPendingReports(reports.filter((r: { status: string }) => r.status === 'pending').length);
      setApprovedReports(reports.filter((r: { status: string }) => r.status === 'approved').length);
    } catch {
      toast.error('Gagal memuat statistik');
    } finally {
      setIsLoading(false);
    }
  };

  const stats: StatCard[] = [
    { title: 'Total Users', value: totalUsers, icon: <Users className="w-6 h-6" />, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { title: 'Total Laporan', value: totalReports, icon: <FileText className="w-6 h-6" />, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { title: 'Pending', value: pendingReports, icon: <Clock className="w-6 h-6" />, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
    { title: 'Approved', value: approvedReports, icon: <CheckCircle className="w-6 h-6" />, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-100' },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Ringkasan data sistem pelaporan</p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center justify-center w-12 h-12 rounded-xl border ${stat.bg}`}>
                  <span className={stat.color}>{stat.icon}</span>
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.title}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
