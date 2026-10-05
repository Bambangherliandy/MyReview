'use client';

import { useState } from 'react';
import { Star, Send, MessageCircle, MapPin } from 'lucide-react';

export default function RatingCard({ client }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Handle Klik Bintang 4 atau 5 (Google Maps)
  const handleHighRating = async (selectedRating) => {
    setRating(selectedRating);
    setLoading(true);

    try {
      // Catat log redireksi Google ke MongoDB
      await fetch('/api/client/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: client.slug,
          rating: selectedRating,
        }),
      });
    } catch (err) {
      console.error('Gagal mencatat feedback:', err);
    } finally {
      // Direct langsung ke Google Maps Review
      window.location.href = client.googleMapsUrl;
    }
  };

  // 2. Handle Submit Form Komplain Bintang 1, 2, atau 3 (WhatsApp & MongoDB)
  const handleLowRatingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simpan masukan ke MongoDB agar tampil di Dashboard Klien
      await fetch('/api/client/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: client.slug,
          rating,
          comment,
        }),
      });
    } catch (err) {
      console.error('Gagal menyimpan feedback:', err);
    } finally {
      // Buka WhatsApp Pemilik Usaha
      const textMessage = encodeURIComponent(
        `Halo *${client.name}*,\nSaya ingin memberikan masukan (Rating: ${rating}★):\n"${comment || 'Tidak ada catatan'}"`
      );
      window.location.href = `https://wa.me/${client.whatsappNumber}?text=${textMessage}`;
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-8 text-center space-y-6">
      
      {/* Header Logo & Nama Tempat */}
      <div className="space-y-3">
        {client.logo ? (
          <img
            src={client.logo}
            alt={client.name}
            className="h-20 w-20 mx-auto rounded-2xl object-cover border-2 border-amber-400 shadow-md"
          />
        ) : (
          <div className="h-20 w-20 mx-auto rounded-2xl bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center text-amber-600 font-bold text-2xl">
            {client.name?.charAt(0)}
          </div>
        )}
        <h1 className="text-xl font-bold text-slate-900">{client.name}</h1>
        <p className="text-xs text-slate-500">
          Bagaimana pengalaman Anda hari ini? Pilihlah rating di bawah ini
        </p>
      </div>

      {/* Pilihan Bintang */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => {
          const activeStar = hoverRating || rating;
          return (
            <button
              key={star}
              type="button"
              disabled={loading}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => {
                if (star >= 4) {
                  handleHighRating(star);
                } else {
                  setRating(star);
                }
              }}
              className="p-1 transition-transform hover:scale-110 focus:outline-none disabled:opacity-50"
            >
              <Star
                size={36}
                className={`${
                  star <= activeStar
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-200'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {/* Form Tambahan Khusus Bintang 1-3 */}
      {rating > 0 && rating <= 3 && (
        <form onSubmit={handleLowRatingSubmit} className="space-y-4 pt-2 text-left animate-fade-in">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
            Kritik dan saran Anda sangat berharga bagi kami. Mohon sampaikan masukan Anda di bawah ini:
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan / Masukan Anda
            </label>
            <textarea
              rows={3}
              required
              placeholder="Tuliskan masukan untuk pelayanan atau rasa di sini..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <MessageCircle size={16} />
            {loading ? 'Mengirim...' : 'Kirim Umpan Balik via WhatsApp'}
          </button>
        </form>
      )}

      {/* Indikator Loading untuk Bintang 4-5 */}
      {loading && rating >= 4 && (
        <div className="flex items-center justify-center gap-2 text-xs text-amber-600 font-semibold animate-pulse">
          <MapPin size={16} />
          <span>Mengarahkan ke Google Maps...</span>
        </div>
      )}

    </div>
  );
}