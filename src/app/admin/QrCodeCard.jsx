'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Printer, Download, ArrowLeftRight } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return (process.env.NEXT_PUBLIC_BASE_URL || window.location.origin).replace(/\/$/, '');
  }
  return (process.env.NEXT_PUBLIC_BASE_URL || 'https://myreview.com').replace(/\/$/, '');
};

/* ------------------------------------------------------------------ */
/*  PENGATURAN                                                         */
/* ------------------------------------------------------------------ */
const PREVIEW_MAX = 320; // sisi terpanjang papan di layar (px)
const MIN_CM = 3;
const MAX_CM = 40;
const MIN_RATIO = 0.5; // tinggi : lebar terkecil yang didukung (1 : 2)
const MAX_RATIO = 2; //   tinggi : lebar terbesar yang didukung (2 : 1)
const A4_W = 19; // area cetak A4 portrait dengan margin 10mm (cm)
const A4_H = 27.7;

// Pilihan cepat ukuran cetak: [lebar, tinggi] dalam cm
const PRINT_PRESETS = [
  [8, 8],
  [10, 10],
  [10, 15],
  [15, 15],
  [15, 20],
  [19, 19],
];

const FONT = 'Poppins, "Google Sans", "Product Sans", Arial, sans-serif';

const parseCm = (v) => {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};

/* ------------------------------------------------------------------ */
/*  Bingkai 4 warna dengan batas melengkung. Koordinat dalam "unit"    */
/*  (1 unit = 1% sisi terpendek papan), jadi ketebalan bingkai selalu  */
/*  sama di semua sisi walau papan persegi panjang.                    */
/* ------------------------------------------------------------------ */
function GoogleFrame({ wn, hn }) {
  const mid = wn / 2;
  const yTop = hn * 0.44;
  const yEdge = hn * 0.49;
  const yB = hn - 15;
  const bottomCurve = `C${mid},${hn - 8} ${mid + 2},${hn - 3} ${mid + 6},${hn}`;
  const leftCurve = `C7,${yTop + 0.5} 5,${yEdge} 0,${yEdge}`; // dari tepi kartu ke tepi papan (kiri)
  const rightCurve = `C${wn - 5},${yEdge} ${wn - 7},${yTop + 0.5} ${wn - 10},${yTop}`; // dari tepi papan ke kartu (kanan)

  const blue = `M0,0 H${mid} V${yTop} H10 ${leftCurve} Z`;
  const red = `M${mid},0 H${wn} V${yEdge} ${rightCurve} H${mid} Z`;
  const green = `M0,${yEdge} C5,${yEdge} 7,${yTop + 0.5} 10,${yTop} H${mid} V${yB} ${bottomCurve} H0 Z`;
  const yellow = `M${wn},${yEdge} ${rightCurve} H${mid} V${yB} ${bottomCurve} H${wn} Z`;

  return (
    <svg
      viewBox={`0 0 ${wn} ${hn}`}
      width="100%"
      height="100%"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, display: 'block' }}
    >
      <path d={blue} fill="#4285F4" stroke="#4285F4" strokeWidth="0.4" />
      <path d={red} fill="#EA4335" stroke="#EA4335" strokeWidth="0.4" />
      <path d={green} fill="#34A853" stroke="#34A853" strokeWidth="0.4" />
      <path d={yellow} fill="#FBBC05" stroke="#FBBC05" strokeWidth="0.4" />
    </svg>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

function NfcPhoneIcon() {
  return (
    <svg viewBox="0 0 96 80" width="100%" fill="none">
      <rect x="46" y="4" width="34" height="68" rx="7" fill="#fff" stroke="#111827" strokeWidth="3" />
      <rect x="57" y="9" width="12" height="3" rx="1.5" fill="#111827" />
      <circle cx="63" cy="64" r="2.5" fill="#111827" />
      <path d="M40 28c4 3.5 4 17 0 20.5" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
      <circle cx="20" cy="40" r="17" fill="#fff" stroke="#111827" strokeWidth="3" />
      <text x="20" y="44" textAnchor="middle" fontSize="11" fontWeight="900" fill="#111827" fontFamily="Arial, sans-serif">
        NFC
      </text>
    </svg>
  );
}

export default function QrCodeCard({ client }) {
  const [url, setUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  // Ukuran cetak (cm). Disimpan sebagai teks supaya enak diketik.
  const [showPrint, setShowPrint] = useState(false);
  const [widthCm, setWidthCm] = useState('10');
  const [heightCm, setHeightCm] = useState('10');
  const lastValid = useRef({ w: 10, h: 10 });

  const cardRef = useRef(null);

  useEffect(() => {
    if (!client?.slug) return;
    const target = `${getBaseUrl()}/${client.slug}`;
    setUrl(target);

    QRCode.toDataURL(target, {
      width: 512,
      margin: 0,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then(setQrCodeDataUrl)
      .catch(() => setError('Gagal membuat QR code'));
  }, [client?.slug]);

  /* ---------- Validasi ukuran ---------- */
  const wIn = parseCm(widthCm);
  const hIn = parseCm(heightCm);
  let sizeProblem = '';
  if (Number.isNaN(wIn) || Number.isNaN(hIn)) sizeProblem = 'Isi lebar dan tinggi dalam cm.';
  else if (wIn < MIN_CM || hIn < MIN_CM || wIn > MAX_CM || hIn > MAX_CM)
    sizeProblem = `Ukuran harus antara ${MIN_CM} dan ${MAX_CM} cm.`;
  else if (hIn / wIn < MIN_RATIO || hIn / wIn > MAX_RATIO)
    sizeProblem = 'Perbandingan lebar : tinggi terlalu ekstrem (maksimal 1 : 2 atau 2 : 1).';

  if (!sizeProblem) lastValid.current = { w: wIn, h: hIn };
  const { w: printW, h: printH } = lastValid.current; // dipakai untuk tampilan, export, dan cetak

  /* ---------- Dimensi papan di layar ---------- */
  const longest = Math.max(printW, printH);
  const wPx = (PREVIEW_MAX * printW) / longest;
  const hPx = (PREVIEW_MAX * printH) / longest;
  const s = Math.min(wPx, hPx) / 100; // 1 unit desain = 1% sisi terpendek
  const wn = wPx / s;
  const hn = hPx / s;
  const u = (n) => `${(n * s).toFixed(3)}px`;

  const exceedsA4 = printW > A4_W || printH > A4_H;
  const fmt = (n) => String(Math.round(n * 10) / 10).replace('.', ',');

  /* ---------- Download ---------- */
  const downloadPng = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: 4,
        style: { margin: '0', transform: 'scale(1)' },
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `standee-${client.slug}.png`;
      a.click();
    } catch (err) {
      console.error('Gagal mengunduh PNG:', err);
      alert('Gagal mengunduh gambar. Pastikan tidak ada ekstensi browser yang memblokir script.');
    } finally {
      setDownloading(false);
    }
  };

  const downloadSvg = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await toSvg(cardRef.current);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `standee-${client.slug}.svg`;
      a.click();
    } catch (err) {
      console.error('Gagal mengunduh SVG:', err);
      alert('Gagal mengunduh SVG.');
    } finally {
      setDownloading(false);
    }
  };

  /* ---------- Cetak: hanya papan, dengan ukuran lebar x tinggi pilihan ---------- */
  const printCard = async () => {
    if (!cardRef.current || sizeProblem) return;
    setDownloading(true);
    let iframe;
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 4,
        style: { margin: '0', transform: 'scale(1)' },
      });

      iframe = document.createElement('iframe');
      iframe.setAttribute('aria-hidden', 'true');
      iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
      document.body.appendChild(iframe);

      const win = iframe.contentWindow;
      const doc = win.document;
      doc.open();
      doc.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Standee ${client.slug}</title>
<style>
  @page { margin: 10mm; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { display: flex; justify-content: center; }
  img { width: ${printW}cm; height: ${printH}cm; display: block;
        -webkit-print-color-adjust: exact; print-color-adjust: exact; }
</style>
</head>
<body><img id="card" alt="Standee ${client.slug}" src="${dataUrl}" /></body>
</html>`);
      doc.close();

      const cleanup = () => iframe && iframe.remove();
      win.onafterprint = cleanup;

      const img = doc.getElementById('card');
      const go = () => {
        win.focus();
        win.print();
        setTimeout(cleanup, 60000);
      };
      if (img.complete) go();
      else img.onload = go;
    } catch (err) {
      console.error('Gagal mencetak:', err);
      alert('Gagal menyiapkan cetakan. Coba unduh PNG lalu cetak dari file tersebut.');
      if (iframe) iframe.remove();
    } finally {
      setDownloading(false);
    }
  };

  if (!client?.slug) return null;

  const label = {
    fontSize: u(2.6),
    fontWeight: 700,
    color: '#1e293b',
    textTransform: 'uppercase',
    marginTop: u(1.4),
    textAlign: 'center',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  };

  const inputCls =
    'w-16 rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 text-center';

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm w-full">
      {/* TEMPLATE STANDEE AKRILIK GOOGLE REVIEW */}
      <div className="my-2" style={{ padding: 10 }}>
        {/* Papan (area yang di-export) */}
        <div
          ref={cardRef}
          style={{
            position: 'relative',
            width: wPx,
            height: hPx,
            borderRadius: u(7),
            boxShadow: `0 ${u(2.5)} ${u(4)} -${u(1)} rgba(0,0,0,0.35)`,
            fontFamily: FONT,
            background: '#fff',
          }}
        >
          {/* Bingkai warna melengkung */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: u(7), overflow: 'hidden' }}>
            <GoogleFrame wn={wn} hn={hn} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 35%, rgba(0,0,0,0.03) 100%)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: u(7),
                boxShadow: `inset 0 0 0 ${u(0.7)} rgba(255,255,255,0.55)`,
              }}
            />
          </div>

          {/* Logo G */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: u(4.5),
              width: u(29),
              height: u(29),
              transform: 'translateX(-50%)',
              background: '#fff',
              borderRadius: '50%',
              padding: u(4.2),
              boxSizing: 'border-box',
              boxShadow: `0 ${u(0.4)} ${u(1.4)} rgba(0,0,0,0.25)`,
              zIndex: 2,
            }}
          >
            <GoogleG />
          </div>

          {/* Kartu putih */}
          <div
            style={{
              position: 'absolute',
              left: u(10),
              right: u(10),
              top: u(19),
              bottom: u(15),
              background: '#fff',
              borderRadius: u(3.6),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: u(15),
              boxSizing: 'border-box',
              boxShadow: `0 ${u(0.3)} ${u(1)} rgba(0,0,0,0.2)`,
            }}
          >
            <div style={{ fontSize: u(3.3), fontWeight: 500, color: '#334155', lineHeight: 1.2 }}>
              Bantu Kami Dengan
            </div>
            <div
              style={{
                fontSize: u(7.4),
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              Google Review
            </div>
            <div
              style={{
                fontSize: u(5),
                lineHeight: 1,
                color: '#F5B800',
                letterSpacing: u(0.3),
                marginTop: u(0.6),
              }}
            >
              ★★★★★
            </div>

            {/* NFC | ATAU | QR */}
            <div
              style={{
                flex: 1,
                width: '100%',
                maxWidth: u(80),
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                padding: `0 ${u(4)} ${u(3)}`,
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: u(25) }}>
                  <NfcPhoneIcon />
                </div>
                <div style={label}>Tempelkan HP Kamu</div>
              </div>

              <div style={{ position: 'relative', alignSelf: 'center', width: u(8), height: u(30) }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    bottom: 0,
                    width: Math.max(1, 0.25 * s),
                    background: '#cbd5e1',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '18%',
                    transform: 'translateX(-50%)',
                    background: '#fff',
                    padding: `${u(0.8)} ${u(0.6)}`,
                    fontSize: u(2.4),
                    fontWeight: 700,
                    color: '#64748b',
                  }}
                >
                  ATAU
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {error ? (
                  <div
                    style={{
                      width: u(23),
                      height: u(23),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: u(2.4),
                      color: '#ef4444',
                      textAlign: 'center',
                    }}
                  >
                    {error}
                  </div>
                ) : qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt={`QR Code ${client.name}`}
                    style={{ width: u(23), height: u(23), objectFit: 'contain', display: 'block' }}
                  />
                ) : (
                  <div style={{ width: u(23), height: u(23), background: '#f1f5f9' }} />
                )}
                <div style={label}>Scan QR</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nama klien & URL (tidak ikut ter-export / tercetak) */}
      <div className="text-center px-2">
        <p className="text-sm font-semibold text-slate-700">{client.name}</p>
        <p className="text-[11px] text-slate-400 break-all font-mono">{url}</p>
      </div>

      {/* PENGATURAN UKURAN CETAK */}
      {showPrint && (
        <div className="w-full rounded-xl border border-slate-200 bg-white p-3 space-y-2.5">
          <p className="text-xs font-bold text-slate-700">Ukuran cetak</p>

          <div className="flex flex-wrap gap-1.5">
            {PRINT_PRESETS.map(([w, h]) => {
              const active = !sizeProblem && printW === w && printH === h;
              return (
                <button
                  key={`${w}x${h}`}
                  type="button"
                  onClick={() => {
                    setWidthCm(String(w));
                    setHeightCm(String(h));
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    active
                      ? 'bg-amber-500 border-amber-500 text-slate-950'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {w} × {h}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor={`w-${client.slug}`} className="text-[11px] text-slate-500">
                Lebar (kiri-kanan)
              </label>
              <div className="flex items-center gap-1">
                <input
                  id={`w-${client.slug}`}
                  type="number"
                  inputMode="decimal"
                  min={MIN_CM}
                  max={MAX_CM}
                  step="0.5"
                  value={widthCm}
                  onChange={(e) => setWidthCm(e.target.value)}
                  className={inputCls}
                />
                <span className="text-xs text-slate-500">cm</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setWidthCm(heightCm);
                setHeightCm(widthCm);
              }}
              title="Tukar lebar dan tinggi"
              aria-label="Tukar lebar dan tinggi"
              className="mb-0.5 p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              <ArrowLeftRight size={14} />
            </button>

            <div className="flex flex-col gap-1">
              <label htmlFor={`h-${client.slug}`} className="text-[11px] text-slate-500">
                Tinggi (atas-bawah)
              </label>
              <div className="flex items-center gap-1">
                <input
                  id={`h-${client.slug}`}
                  type="number"
                  inputMode="decimal"
                  min={MIN_CM}
                  max={MAX_CM}
                  step="0.5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className={inputCls}
                />
                <span className="text-xs text-slate-500">cm</span>
              </div>
            </div>
          </div>

          {sizeProblem ? (
            <p className="text-[11px] leading-snug text-red-500">{sizeProblem}</p>
          ) : (
            <p className="text-[11px] leading-snug text-slate-400">
              Tampilan papan di atas ikut berubah sesuai ukuran ini, begitu juga hasil PNG dan SVG.
              {exceedsA4 && (
                <span className="text-amber-600">
                  {' '}
                  Ukuran melebihi A4 ({fmt(A4_W)} × {fmt(A4_H)} cm), pilih kertas yang lebih besar di dialog cetak.
                </span>
              )}{' '}
              Di dialog cetak, pilih skala 100% (Default).
            </p>
          )}

          <button
            type="button"
            onClick={printCard}
            disabled={downloading || !qrCodeDataUrl || !!sizeProblem}
            className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 disabled:opacity-50"
          >
            <Printer size={14} />
            <span>
              {downloading ? 'Menyiapkan...' : `Cetak ${fmt(printW)} × ${fmt(printH)} cm`}
            </span>
          </button>
        </div>
      )}

      {/* TOMBOL AKSI */}
      <div className="flex flex-wrap gap-1.5 w-full pt-1">
        <button
          type="button"
          onClick={() => setShowPrint((v) => !v)}
          disabled={!qrCodeDataUrl}
          className="flex-1 py-2 px-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <Printer size={14} />
          <span>Cetak</span>
        </button>

        <button
          type="button"
          onClick={downloadPng}
          disabled={downloading || !qrCodeDataUrl}
          className="flex-1 py-2 px-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <Download size={14} />
          <span>{downloading ? 'Proses...' : 'PNG'}</span>
        </button>

        <button
          type="button"
          onClick={downloadSvg}
          disabled={downloading || !qrCodeDataUrl}
          className="flex-1 py-2 px-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <Download size={14} />
          <span>{downloading ? 'Proses...' : 'SVG'}</span>
        </button>
      </div>
    </div>
  );
}