import Link from 'next/link';
import { Megaphone, ArrowRight, ShieldCheck, Users, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              Suara Rakyat
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors hidden sm:block"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-20 pb-28 lg:pt-32 lg:pb-40">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-emerald-200 to-teal-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight mb-8">
              Suarakan Aspirasimu, <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Wujudkan Perubahan.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 mb-10 leading-relaxed">
              Platform digital untuk masyarakat menyampaikan pengaduan dan aspirasi secara transparan, akuntabel, dan efisien. Bersama membangun lingkungan yang lebih baik.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-semibold rounded-2xl shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
              >
                Mulai Lapor <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 text-base font-semibold rounded-2xl border border-slate-200 shadow-sm transition-all"
              >
                Cek Status Laporan
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-20 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900">Mengapa Menggunakan Suara Rakyat?</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-7 h-7 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Aman & Terverifikasi</h3>
                <p className="text-slate-500 leading-relaxed">Data pengaduan Anda dijamin kerahasiaannya dan akan langsung ditangani oleh instansi yang berwenang.</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                  <Clock className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Respon Cepat</h3>
                <p className="text-slate-500 leading-relaxed">Pantau status laporan Anda secara real-time. Dapatkan notifikasi saat laporan sedang diproses atau disetujui.</p>
              </div>
              <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-violet-100 flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Untuk Semua</h3>
                <p className="text-slate-500 leading-relaxed">Antarmuka yang mudah digunakan oleh seluruh kalangan masyarakat, kapanpun dan dimanapun.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-center">
        <p className="text-slate-400 text-sm">© 2026 Suara Rakyat. Sistem Pelaporan Pengaduan Masyarakat.</p>
      </footer>
    </div>
  );
}
