'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  QrCode,
  Star,
  MessageSquare,
  TrendingUp,
  LogOut,
  ExternalLink,
  Store,
  Clock,
  AlertCircle,
} from 'lucide-react';

const COLORS = ['#f59e0b', '#3b82f6']; // Warna Google Maps (Amber) vs WA (Blue)

export default function ClientDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/client/dashboard');
        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Gagal memuat data');
        }

        setData(json.data);
      } catch (err) {
        setError(err.message);
        // Redirect ke login jika session habis
        setTimeout(() => router.push('/login'), 1500);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Memuat data analitik...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-slate-800 border border-slate-700 p-6 rounded-2xl text-center max-w-sm space-y-4">
          <AlertCircle className="mx-auto text-red-400" size={36} />
          <p className="text-sm text-slate-300">{error}</p>
          <p className="text-xs text-slate-500">Mengarahkan kembali ke halaman login...</p>
        </div>
      </div>
    );
  }

  const conversionRate = Math.round((data.googleRedirects / data.totalScans) * 100) || 0;

  const pieData = [
    { name: 'Google Review (4-5★)', value: data.googleRedirects },
    { name: 'WhatsApp Feedback (1-3★)', value: data.waRedirects },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER BAR */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="flex items-center gap-4">
            {data.logo ? (
              <img src={data.logo} alt={data.name} className="h-12 w-12 rounded-xl object-cover border border-slate-700" />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <Store size={24} />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                {data.name}
              </h1>
              <p className="text-xs text-slate-400">
                Slug: <span className="font-mono text-amber-400">/{data.slug}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <a
              href={`/${data.slug}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              <ExternalLink size={14} />
              Preview Live Page
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl border border-red-500/20 transition-colors"
            >
              <LogOut size={14} />
              Keluar
            </button>
          </div>
        </header>

        {/* TOP METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-medium">Total QR Scan</span>
              <QrCode size={18} className="text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-white">{data.totalScans}</p>
            <p className="text-[11px] text-slate-500">Akses halaman ulasan</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-medium">Review Google (4-5★)</span>
              <Star size={18} className="text-amber-400 fill-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-400">{data.googleRedirects}</p>
            <p className="text-[11px] text-slate-500">Diarahkan ke Google Maps</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-medium">Privat Feedback (1-3★)</span>
              <MessageSquare size={18} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{data.waRedirects}</p>
            <p className="text-[11px] text-slate-500">Diarahkan ke WhatsApp</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-xs font-medium">Tingkat Konversi</span>
              <TrendingUp size={18} className="text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-emerald-400">{conversionRate}%</p>
            <p className="text-[11px] text-slate-500">Pengunjung jadi Reviewer</p>
          </div>
        </div>

        {/* GRAFIK ANALITIK */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart 7 Hari Terakhir */}
          <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-amber-400" />
              Trafik Scan & Redireksi (7 Hari Terakhir)
            </h2>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="google" name="Google Maps" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="wa" name="WhatsApp" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart Distribusi */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
            <h2 className="text-sm font-bold text-white">Distribusi Jalur Rating</h2>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-amber-400">
                <span className="flex items-center gap-2">● Rating 4-5 ★ (Google)</span>
                <span className="font-bold">{data.googleRedirects}</span>
              </div>
              <div className="flex justify-between items-center text-blue-400">
                <span className="flex items-center gap-2">● Rating 1-3 ★ (WhatsApp)</span>
                <span className="font-bold">{data.waRedirects}</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABEL MASUKAN PRIVAT (RATING 1-3 STAR) */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-400" />
                Masukan & Kritik Privat (Rating 1–3★)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Pesan komplain yang disampaikan pelanggan secara langsung
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="p-3">Waktu</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Isi Masukan / Komplain</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.feedbacks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">
                      Belum ada masukan privat.
                    </td>
                  </tr>
                ) : (
                  data.feedbacks.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50">
                      <td className="p-3 text-slate-400 font-mono flex items-center gap-1.5">
                        <Clock size={12} />
                        {item.date}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold">
                          {item.rating} <Star size={10} className="fill-amber-400" />
                        </span>
                      </td>
                      <td className="p-3 text-slate-200">{item.comment}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-1 rounded-full font-semibold text-[10px] ${
                            item.status === 'Need Action'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}