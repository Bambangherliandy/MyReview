'use client';

import { useState, useEffect } from 'react';
import QrCodeCard from './QrCodeCard';


export default function AdminPage() {
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form State Utama
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Form State tambahan untuk Kredensial Login Client
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients');
      const json = await res.json();
      if (json.success) {
        setClients(json.data);
      }
    } catch (err) {
      console.error('Gagal mengambil data clients:', err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const resetForm = () => {
    setSlug('');
    setName('');
    setLogo('');
    setGoogleMapsUrl('');
    setWhatsappNumber('');
    setEmail('');
    setPassword('');
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name,
          logo,
          googleMapsUrl,
          whatsappNumber,
          email,
          password,
        }),
      });

      const json = await res.json();

      if (json.success) {
        setMessage('✅ Data & Akun Klien berhasil disimpan!');
        resetForm();
        fetchClients();
      } else {
        setMessage(`❌ Error: ${json.message}`);
      }
    } catch (err) {
      setMessage('❌ Terjadi kesalahan koneksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (key) => {
    const item = clients[key];
    setSlug(key);
    setName(item.name || '');
    setLogo(item.logo || '');
    setGoogleMapsUrl(item.googleMapsUrl || '');
    setWhatsappNumber(item.whatsappNumber || '');
    setEmail(item.email || '');
    setPassword(''); // Biarkan kosong jika tidak ingin mengubah password
    setIsEditing(true);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clientKeys = Object.keys(clients);

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard - MyReview</h1>
            <p className="text-xs text-slate-500 mt-1">
              Kelola data lokasi, link Google Maps, WhatsApp, dan kredensial login klien
            </p>
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
            Admin Mode
          </span>
        </div>

        {/* FORM INPUT */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold mb-4 text-slate-900">
            {isEditing ? `Edit Data Klien: /${slug}` : 'Tambah Data & Akun Klien'}
          </h2>

          {message && (
            <div className="mb-4 p-3 text-xs rounded-xl bg-slate-100 border border-slate-300 font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* INFORMASI BISNIS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slug / Path URL (misal: kopi-kenangan)
                </label>
                <input
                  type="text"
                  required
                  readOnly={isEditing}
                  placeholder="contoh: kopi-kenangan"
                  value={slug}
                  onChange={(e) =>
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, '')
                    )
                  }
                  className={`w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                    isEditing ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Tempat / Kafe
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: Kopi Kenangan - Outlet Merdeka"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* AKUN LOGIN KLIEN (NEW SECTION) */}
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-amber-900 block">
                🔑 Kredensial Login Client Portal
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email / Username Klien
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="kopi-kenangan@myreview.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password {isEditing && '(Kosongkan jika tidak diubah)'}
                  </label>
                  <input
                    type="password"
                    required={!isEditing}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm p-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL Logo Gambar (Opsional)
                </label>
                <input
                  type="url"
                  placeholder="https://domain.com/logo.jpg"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor WhatsApp Pemilik (Gunakan awalan 62)
                </label>
                <input
                  type="text"
                  required
                  placeholder="contoh: 6281234567890"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link Google Maps Direct Review
              </label>
              <textarea
                rows={2}
                required
                placeholder="https://g.page/r/XXXXXXXX/review"
                value={googleMapsUrl}
                onChange={(e) => setGoogleMapsUrl(e.target.value)}
                className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono text-xs"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-slate-950 font-bold p-3 rounded-xl transition-all text-sm shadow-sm"
              >
                {loading ? 'Menyimpan...' : 'Simpan Data & Akun Klien'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm"
                >
                  Batal Edit
                </button>
              )}
            </div>
          </form>
        </div>

        {/* TABEL DAFTAR KLIEN */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold mb-4 text-slate-900">Daftar Klien Terdaftar</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Nama Tempat</th>
                  <th className="p-3">Email / Username Login</th>
                  <th className="p-3">WhatsApp</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clientKeys.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-slate-500">
                      Belum ada klien terdaftar.
                    </td>
                  </tr>
                )}
                {clientKeys.map((key) => (
                  <tr key={key} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-amber-700">/{key}</td>
                    <td className="p-3 font-medium text-slate-900">{clients[key].name}</td>
                    <td className="p-3 font-mono text-slate-600">{clients[key].email || '-'}</td>
                    <td className="p-3">{clients[key].whatsappNumber}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleEdit(key)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg font-semibold text-[11px]"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* QR CODE KLIEN */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold mb-1 text-slate-900">QR Code Klien</h2>
          <p className="text-xs text-slate-500 mb-4">
            QR otomatis mengarah ke halaman rating masing-masing klien.
          </p>
 
          {clientKeys.length === 0 ? (
            <p className="text-xs text-slate-500">Belum ada klien terdaftar.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clientKeys.map((key) => (
                <QrCodeCard key={key} client={{ ...clients[key], slug: key }} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );

  
}