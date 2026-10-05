'use client';

import React from 'react';
import { Smartphone, Radio } from 'lucide-react';

export default function ReviewCardTemplate({ clientName = 'Nama Usaha', slug = 'demo' }) {
  // URL tujuan yang di-scan oleh pelanggan
  const targetUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/${slug}` 
    : `https://myreview.id/${slug}`;

  // Menggunakan API QR Server agar tidak perlu install package tambahan
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetUrl)}&margin=1`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center gap-6 my-6 font-sans">
      {/* Tombol Aksi Cetak (Sembunyi saat di-print) */}
      <div className="print:hidden flex gap-3">
        <button
          onClick={handlePrint}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          🖨️ Cetak / Simpan PDF
        </button>
      </div>

      {/* CARD TEMPLATE (Bisa Di-print Langsung) */}
      <div id="printable-card" className="print:m-0 print:shadow-none">
        <div className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] rounded-[36px] p-3 shadow-2xl overflow-hidden flex items-center justify-center bg-white">
          
          {/* Latar Belakang 4 Warna Google */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            <div className="bg-[#4285F4]" /> {/* Blue */}
            <div className="bg-[#EA4335]" /> {/* Red */}
            <div className="bg-[#34A853]" /> {/* Green */}
            <div className="bg-[#FBBC05]" /> {/* Yellow */}
          </div>

          {/* Kartu Putih Utama */}
          <div className="relative w-full h-full bg-white rounded-[28px] p-5 flex flex-col items-center justify-between shadow-inner border border-slate-100">
            
            {/* Logo Google "G" Atas Overflow */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-white rounded-full p-1.5 shadow-md flex items-center justify-center border border-slate-100">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>

            {/* Header Text */}
            <div className="text-center pt-5">
              <p className="text-xs sm:text-sm font-semibold text-slate-700 tracking-tight">
                Bantu Kami Dengan
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Google Review
              </h2>
              
              {/* Rating Bintang */}
              <div className="flex justify-center gap-1 mt-1 text-amber-400">
                {'★'.repeat(5).split('').map((star, i) => (
                  <span key={i} className="text-lg sm:text-xl drop-shadow-sm">{star}</span>
                ))}
              </div>
            </div>

            {/* Area NFC dan QR Code */}
            <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-2">
              
              {/* Bagian Kiri: NFC */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="border-2 border-slate-900 rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-sm bg-slate-50">
                  <span className="text-[10px] font-black tracking-widest text-slate-900">NFC</span>
                  <Radio size={14} className="text-slate-900 rotate-90" />
                  <Smartphone size={16} className="text-slate-900" />
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-800 mt-2 uppercase tracking-tight">
                  Tempelkan HP Kamu
                </p>
              </div>

              {/* Pemisah Tengah */}
              <div className="flex flex-col items-center justify-center px-1">
                <div className="w-[1px] h-8 bg-slate-300" />
                <span className="text-[9px] font-bold text-slate-400 my-1">ATAU</span>
                <div className="w-[1px] h-8 bg-slate-300" />
              </div>

              {/* Bagian Kanan: QR Code Otomatis */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-1 bg-white border-2 border-slate-900 rounded-xl shadow-sm">
                  <img
                    src={qrCodeUrl}
                    alt={`QR Code ${clientName}`}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg"
                  />
                </div>
                <p className="text-[10px] sm:text-[11px] font-bold text-slate-800 mt-2 uppercase tracking-tight">
                  Scan QR
                </p>
              </div>

            </div>

            {/* Nama Tempat / Klien di Bagian Bawah */}
            <div className="text-center pb-1">
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-0.5 rounded-full">
                {clientName}
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}