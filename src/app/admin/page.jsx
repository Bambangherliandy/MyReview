'use client';

import { useState, useEffect } from 'react';
import QrCodeCard from './QrCodeCard';

// Link tulis-ulasan Google dibentuk otomatis dari Place ID
const REVIEW_BASE = 'https://search.google.com/local/writereview?placeid=';

// Terima Place ID polos, atau link lengkap yang tidak sengaja ditempel (diambil placeid-nya saja)
const extractPlaceId = (value) => {
  const raw = String(value || '').trim();
  const match = raw.match(/[?&]placeid=([^&#\s]+)/i);
  let id = match ? match[1] : raw;
  try {
    id = decodeURIComponent(id);
  } catch {
    // abaikan jika bukan hasil encode
  }
  return id.replace(/[^A-Za-z0-9_-]/g, '');
};

const isValidPlaceId = (id) => /^[A-Za-z0-9_-]{10,}$/.test(id);

export default function AdminPage() {
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // slug klien yang akan dihapus
  const [deleting, setDeleting] = useState(false);

  // Form State Utama
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [legacyUrl, setLegacyUrl] = useState(''); // link lama (bukan format placeid) milik klien yang sedang diedit
  const [whatsappNumber, setWhatsappNumber] = useState('');

  // Form State tambahan untuk Kredensial Login Client
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Link ulasan final: dari Place ID, atau link lama bila Place ID belum diisi saat edit
  const placeIdOk = isValidPlaceId(placeId);
  const reviewUrl = placeIdOk
    ? `${REVIEW_BASE}${encodeURIComponent(placeId)}`
    : isEditing && legacyUrl
      ? legacyUrl
      : '';

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

  // Esc menutup dialog konfirmasi hapus
  useEffect(() => {
    if (!deleteTarget) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !deleting) setDeleteTarget(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteTarget, deleting]);

  const resetForm = () => {
    setSlug('');
    setName('');
    setLogo('');
    setPlaceId('');
    setLegacyUrl('');
    setWhatsappNumber('');
    setEmail('');
    setPassword('');
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!reviewUrl) {
      setMessage('❌ Isi Place ID Google Maps yang valid (minimal 10 karakter huruf/angka).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name,
          logo,
          googleMapsUrl: reviewUrl, // tetap disimpan di field yang sama, jadi bagian lain tidak perlu diubah
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
    const stored = item.googleMapsUrl || '';
    const fromUrl = /placeid=/i.test(stored) ? extractPlaceId(stored) : '';

    setSlug(key);
    setName(item.name || '');
    setLogo(item.logo || '');
    setPlaceId(fromUrl);
    setLegacyUrl(fromUrl ? '' : stored); // link format lama tetap aman bila Place ID tidak diisi
    setWhatsappNumber(item.whatsappNumber || '');
    setEmail(item.email || '');
    setPassword(''); // Biarkan kosong jika tidak ingin mengubah password
    setIsEditing(true);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const key = deleteTarget;
    setDeleting(true);
    setMessage('');

    try {
      const res = await fetch(`/api/admin/clients?slug=${encodeURIComponent(key)}`, {
        method: 'DELETE',
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.success !== false) {
        setMessage(`✅ Klien /${key} berhasil dihapus.`);
        if (isEditing && slug === key) resetForm(); // jika sedang diedit, kosongkan form
        await fetchClients();
      } else {
        setMessage(`❌ Gagal menghapus: ${json.message || 'terjadi kesalahan.'}`);
      }
    } catch (err) {
      setMessage('❌ Terjadi kesalahan koneksi saat menghapus.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
              Kelola data lokasi, Place ID Google Maps, WhatsApp, dan kredensial login klien
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

            {/* AKUN LOGIN KLIEN */}
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

            {/* PLACE ID GOOGLE MAPS */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Place ID Google Maps
              </label>
              <input
                type="text"
                required={!(isEditing && legacyUrl)}
                autoComplete="off"
                spellCheck={false}
                placeholder="contoh: ChIJN1t_tDe1EmsRUsoyG83frY4"
                value={placeId}
                onChange={(e) => setPlaceId(extractPlaceId(e.target.value))}
                className="w-full text-sm p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono"
              />
              <p className="mt-1.5 text-[11px] leading-snug text-slate-500">
                Cukup isi Place ID-nya saja, link ulasan dibuat otomatis. Cari Place ID di{' '}
                <a
                  href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-amber-700 underline"
                >
                  Google Place ID Finder
                </a>
                .
              </p>

              {placeId && !placeIdOk && (
                <p className="mt-1.5 text-[11px] text-red-500">
                  Place ID terlalu pendek. Pastikan disalin lengkap.
                </p>
              )}

              {isEditing && legacyUrl && !placeIdOk && (
                <p className="mt-1.5 rounded-lg bg-slate-100 p-2 text-[11px] leading-snug text-slate-600">
                  Klien ini masih memakai link lama dan akan tetap dipakai jika Place ID dikosongkan:{' '}
                  <span className="break-all font-mono">{legacyUrl}</span>
                </p>
              )}

              {reviewUrl && placeIdOk && (
                <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                  <p className="text-[11px] font-semibold text-emerald-800">Link ulasan yang akan disimpan:</p>
                  <a
                    href={reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-mono text-[11px] text-emerald-700 underline"
                  >
                    {reviewUrl}
                  </a>
                </div>
              )}
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
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(key)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg font-semibold text-[11px]"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(key)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1 rounded-lg font-semibold text-[11px]"
                        >
                          Hapus
                        </button>
                      </div>
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

      {/* DIALOG KONFIRMASI HAPUS */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="delete-title" className="text-lg font-bold text-slate-900">
              Hapus klien ini?
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              <span className="font-semibold text-slate-900">
                {clients[deleteTarget]?.name || deleteTarget}
              </span>{' '}
              (<span className="font-mono text-xs">/{deleteTarget}</span>) beserta akun login dan datanya
              akan dihapus permanen. QR code yang sudah dicetak untuk klien ini tidak akan berfungsi lagi.
            </p>
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? 'Menghapus...' : 'Ya, hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}