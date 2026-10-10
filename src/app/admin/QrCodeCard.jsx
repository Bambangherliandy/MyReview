'use client';

import { useState, useEffect, useRef, useId } from 'react';
import QRCode from 'qrcode';
import { Printer, Download, ArrowLeftRight, ChevronDown } from 'lucide-react';
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

// Font. Kalau Anda memuat Playfair Display / Poppins lewat next/font dan
// memberi variabel --font-playfair / --font-poppins, otomatis terpakai.
// Kalau tidak, jatuh ke Georgia (serif) dan Arial.
const FONT_SANS = 'var(--font-poppins, Poppins), "Google Sans", Arial, sans-serif';
const FONT_SERIF = 'var(--font-playfair, "Playfair Display"), "Cormorant Garamond", Georgia, "Times New Roman", serif';

// Warna emas dipakai bersama oleh tema premium
const GOLD_STOPS = ['#8A6A1F', '#F3DC8E', '#C79A2E', '#F3DC8E', '#8A6A1F'];
const GOLD_STOPS_DEEP = ['#7A5A14', '#D9B65B', '#A97C20', '#D9B65B', '#7A5A14'];

/* ------------------------------------------------------------------ */
/*  TEMA DESAIN                                                        */
/* ------------------------------------------------------------------ */
const THEMES = {
  midnight: {
    kind: 'premium',
    title: 'Midnight Gold',
    swatch: 'linear-gradient(135deg,#0A1020,#1B2A4A)',
    bgA: '#080D1A',
    bgB: '#18264A',
    glow: 'rgba(130,165,255,0.22)',
    gloss: 'rgba(255,255,255,0.10)',
    gold: GOLD_STOPS,
    goldSolid: '#E8C96E',
    text: '#FFFFFF',
    sub: '#E2C777',
    label: '#C7D1E6',
    name: '#F6E6B4',
    iconStroke: '#E8C96E',
    iconFill: 'rgba(255,255,255,0.05)',
  },
  emerald: {
    kind: 'premium',
    title: 'Emerald Gold',
    swatch: 'linear-gradient(135deg,#06201A,#14503F)',
    bgA: '#051A15',
    bgB: '#124A3A',
    glow: 'rgba(120,230,190,0.20)',
    gloss: 'rgba(255,255,255,0.10)',
    gold: GOLD_STOPS,
    goldSolid: '#E8C96E',
    text: '#FFFFFF',
    sub: '#E2C777',
    label: '#C5DDD3',
    name: '#F6E6B4',
    iconStroke: '#E8C96E',
    iconFill: 'rgba(255,255,255,0.05)',
  },
  ivory: {
    kind: 'premium',
    title: 'Ivory Espresso',
    swatch: 'linear-gradient(135deg,#FBF6EC,#E6D6B8)',
    bgA: '#FFFDF8',
    bgB: '#EEE1CB',
    glow: 'rgba(255,255,255,0.9)',
    gloss: 'rgba(255,255,255,0.35)',
    gold: GOLD_STOPS_DEEP,
    goldSolid: '#A97C20',
    text: '#2B1D14',
    sub: '#9A7326',
    label: '#5A4636',
    name: '#2B1D14',
    iconStroke: '#2B1D14',
    iconFill: 'rgba(169,124,32,0.08)',
  },
  obsidian: {
    kind: 'premium',
    title: 'Obsidian Black',
    swatch: 'linear-gradient(135deg,#050505,#2a2a2a)',
    bgA: '#040404',
    bgB: '#1f1f1f',
    glow: 'rgba(255,255,255,0.12)',
    gloss: 'rgba(255,255,255,0.10)',
    gold: GOLD_STOPS,
    stars: GOLD_STOPS,
    goldSolid: '#E8C96E',
    text: '#FFFFFF',
    sub: '#E2C777',
    label: '#D4D4D4',
    name: '#F6E6B4',
    iconStroke: '#E8C96E',
    iconFill: 'rgba(255,255,255,0.05)',
  },
  burgundy: {
    kind: 'premium',
    title: 'Burgundy Velvet',
    swatch: 'linear-gradient(135deg,#2A0610,#7A1A2E)',
    bgA: '#240510',
    bgB: '#6E1428',
    glow: 'rgba(255,170,170,0.20)',
    gloss: 'rgba(255,255,255,0.10)',
    gold: GOLD_STOPS,
    stars: GOLD_STOPS,
    goldSolid: '#E8C96E',
    text: '#FFFFFF',
    sub: '#EBCB7A',
    label: '#EBCFD3',
    name: '#F6E6B4',
    iconStroke: '#E8C96E',
    iconFill: 'rgba(255,255,255,0.05)',
  },
  silver: {
    kind: 'premium',
    title: 'Royal Silver',
    swatch: 'linear-gradient(135deg,#0B1220,#2B3550)',
    bgA: '#090E1B',
    bgB: '#252F48',
    glow: 'rgba(200,215,255,0.20)',
    gloss: 'rgba(255,255,255,0.12)',
    gold: ['#6B7280', '#F3F4F6', '#9CA3AF', '#F3F4F6', '#6B7280'],
    stars: GOLD_STOPS,
    goldSolid: '#D1D5DB',
    text: '#FFFFFF',
    sub: '#D1D5DB',
    label: '#C7CEDC',
    name: '#F3F4F6',
    iconStroke: '#D1D5DB',
    iconFill: 'rgba(255,255,255,0.05)',
  },
  terracotta: {
    kind: 'premium',
    title: 'Terracotta Cafe',
    swatch: 'linear-gradient(135deg,#5A2312,#C0683F)',
    bgA: '#4E1D0E',
    bgB: '#B25A36',
    glow: 'rgba(255,225,185,0.28)',
    gloss: 'rgba(255,255,255,0.12)',
    gold: ['#B8935A', '#FFF1D0', '#D9B77C', '#FFF1D0', '#B8935A'],
    stars: GOLD_STOPS,
    goldSolid: '#F2D7A5',
    text: '#FFF6E8',
    sub: '#F2D7A5',
    label: '#F8E6CC',
    name: '#FFF1D0',
    iconStroke: '#F2D7A5',
    iconFill: 'rgba(255,255,255,0.07)',
  },
  chalk: {
    kind: 'premium',
    title: 'Chalkboard Cafe',
    swatch: 'linear-gradient(135deg,#1B211E,#323C37)',
    bgA: '#171C19',
    bgB: '#303A35',
    glow: 'rgba(255,255,255,0.10)',
    gloss: 'rgba(255,255,255,0.06)',
    gold: ['#CFCFC6', '#FFFFFF', '#E5E5DC', '#FFFFFF', '#CFCFC6'],
    stars: GOLD_STOPS,
    goldSolid: '#EDEDE3',
    text: '#FFFFFF',
    sub: '#E5E5DC',
    label: '#D9D9CF',
    name: '#FFFFFF',
    iconStroke: '#EDEDE3',
    iconFill: 'rgba(255,255,255,0.04)',
    dash: true,
    accent: 'bar',
  },
  rose: {
    kind: 'premium',
    title: 'Rose Blush',
    swatch: 'linear-gradient(135deg,#FFF7F5,#F0C9C0)',
    bgA: '#FFF8F6',
    bgB: '#F5D9D2',
    glow: 'rgba(255,255,255,0.9)',
    gloss: 'rgba(255,255,255,0.40)',
    gold: ['#9C5A4B', '#E8B4A4', '#C27D6B', '#E8B4A4', '#9C5A4B'],
    stars: GOLD_STOPS_DEEP,
    goldSolid: '#B8705E',
    text: '#3A2220',
    sub: '#A9645A',
    label: '#6B4A45',
    name: '#3A2220',
    iconStroke: '#3A2220',
    iconFill: 'rgba(184,112,94,0.08)',
  },
  sage: {
    kind: 'premium',
    title: 'Sage Minimal',
    swatch: 'linear-gradient(135deg,#FAFBF7,#CFDBC0)',
    bgA: '#FBFCF8',
    bgB: '#E1E9D5',
    glow: 'rgba(255,255,255,0.9)',
    gloss: 'rgba(255,255,255,0.40)',
    gold: ['#5B6B4A', '#9DB08A', '#738862', '#9DB08A', '#5B6B4A'],
    stars: GOLD_STOPS_DEEP,
    goldSolid: '#6B7F58',
    text: '#1F2A1B',
    sub: '#5F7350',
    label: '#4B5A40',
    name: '#1F2A1B',
    iconStroke: '#1F2A1B',
    iconFill: 'rgba(107,127,88,0.10)',
    accent: 'bar',
  },
  minimal: {
    kind: 'premium',
    title: 'Minimal Putih',
    swatch: 'linear-gradient(135deg,#FFFFFF,#E5E7EB)',
    bgA: '#FFFFFF',
    bgB: '#F1F3F6',
    glow: 'rgba(255,255,255,1)',
    gloss: 'rgba(255,255,255,0.5)',
    gold: ['#6B7280', '#D1D5DB', '#9CA3AF', '#D1D5DB', '#6B7280'],
    stars: GOLD_STOPS_DEEP,
    goldSolid: '#111827',
    text: '#0F172A',
    sub: '#64748B',
    label: '#475569',
    name: '#0F172A',
    iconStroke: '#0F172A',
    iconFill: 'rgba(15,23,42,0.04)',
    accent: 'bar',
  },
  classic: {
    kind: 'classic',
    title: 'Google Klasik',
    swatch: 'conic-gradient(#4285F4 0 25%,#EA4335 0 50%,#FBBC05 0 75%,#34A853 0)',
  },
};

// Tema klasik tampil paling depan di pilihan tema
const THEME_KEYS = ['classic', ...Object.keys(THEMES).filter((k) => k !== 'classic')];

const parseCm = (v) => {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};

/* ------------------------------------------------------------------ */
/*  Elemen bersama                                                     */
/* ------------------------------------------------------------------ */
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

function NfcPhoneIcon({ stroke = '#111827', fill = '#fff', textFill = '#111827' }) {
  return (
    <svg viewBox="0 0 96 80" width="100%" fill="none">
      <rect x="46" y="4" width="34" height="68" rx="7" fill={fill} stroke={stroke} strokeWidth="3" />
      <rect x="57" y="9" width="12" height="3" rx="1.5" fill={stroke} />
      <circle cx="63" cy="64" r="2.5" fill={stroke} />
      <path d="M40 28c4 3.5 4 17 0 20.5" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
      <circle cx="20" cy="40" r="17" fill={fill} stroke={stroke} strokeWidth="3" />
      <text x="20" y="44" textAnchor="middle" fontSize="11" fontWeight="900" fill={textFill} fontFamily="Arial, sans-serif">
        NFC
      </text>
    </svg>
  );
}

function GoldStars({ uid, stops }) {
  const id = `stars-${uid}`;
  const star = 'M11 1.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L11 16.3 5.1 19.6l1.3-6.6L1.5 8.4l6.6-.8z';
  return (
    <svg viewBox="0 0 120 22" style={{ display: 'block', width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {stops.map((c, i) => (
            <stop key={i} offset={`${(i / (stops.length - 1)) * 100}%`} stopColor={c} />
          ))}
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={star} transform={`translate(${i * 24 - 0.5} 0)`} fill={`url(#${id})`} />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  TEMA KLASIK: bingkai 4 warna melengkung + kartu putih              */
/* ------------------------------------------------------------------ */
function GoogleFrame({ wn, hn }) {
  const mid = wn / 2;
  const yTop = hn * 0.44;
  const yEdge = hn * 0.49;
  const yB = hn - 15;
  const bottomCurve = `C${mid},${hn - 8} ${mid + 2},${hn - 3} ${mid + 6},${hn}`;
  const leftCurve = `C7,${yTop + 0.5} 5,${yEdge} 0,${yEdge}`;
  const rightCurve = `C${wn - 5},${yEdge} ${wn - 7},${yTop + 0.5} ${wn - 10},${yTop}`;

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

function ClassicBoard({ u, s, wn, hn, qr, error, name, alt }) {
  const nameLen = String(name || '').length || 1;
  const nameFont = Math.max(3.2, Math.min(4.8, 46 / (nameLen * 0.58)));
  const hair = Math.max(1, 0.28 * s);
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

  return (
    <>
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

      {/* Nama usaha: tanpa kotak putih, menyatu dengan bingkai */}
      {name && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: u(3.6),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: u(2),
            padding: `0 ${u(9)}`,
            boxSizing: 'border-box',
            zIndex: 2,
          }}
        >
          <div
            style={{
              flex: '1 1 0',
              minWidth: 0,
              maxWidth: u(14),
              height: hair,
              background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9))',
            }}
          />
          <div
            style={{
              width: u(1.3),
              height: u(1.3),
              background: '#fff',
              transform: 'rotate(45deg)',
              flex: '0 0 auto',
            }}
          />
          <span
            style={{
              flex: '0 1 auto',
              minWidth: 0,
              fontFamily: FONT_SERIF,
              fontSize: u(nameFont),
              fontWeight: 600,
              color: '#fff',
              letterSpacing: '0.05em',
              lineHeight: 1.25,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textShadow: `0 ${u(0.3)} ${u(0.9)} rgba(0,0,0,0.35)`,
            }}
          >
            {name}
          </span>
          <div
            style={{
              width: u(1.3),
              height: u(1.3),
              background: '#fff',
              transform: 'rotate(45deg)',
              flex: '0 0 auto',
            }}
          />
          <div
            style={{
              flex: '1 1 0',
              minWidth: 0,
              maxWidth: u(14),
              height: hair,
              background: 'linear-gradient(270deg, rgba(255,255,255,0), rgba(255,255,255,0.9))',
            }}
          />
        </div>
      )}

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
            ) : qr ? (
              <img src={qr} alt={alt} style={{ width: u(23), height: u(23), objectFit: 'contain', display: 'block' }} />
            ) : (
              <div style={{ width: u(23), height: u(23), background: '#f1f5f9' }} />
            )}
            <div style={label}>Scan QR</div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  TEMA PREMIUM: latar gelap/ivory, garis emas, aksen 4 warna Google  */
/*  di sudut, tipografi serif, nama toko bergaya elegan                */
/* ------------------------------------------------------------------ */
function PremiumBoard({ pal, u, s, wn, hn, qr, error, name, alt, uid }) {
  const R = 22; // ukuran aksen sudut
  const K = 0.3; // makin kecil makin melengkung
  const goldCss = `linear-gradient(135deg, ${pal.gold.join(',')})`;
  const goldLineH = (dir) =>
    `linear-gradient(${dir}, rgba(0,0,0,0), ${pal.gold[1]}, ${pal.gold[2]})`;
  const hair = Math.max(1, 0.28 * s);

  const nameLen = String(name || '').length || 1;
  const nameFont = Math.max(3, Math.min(5.2, 44 / (nameLen * 0.56)));

  const label = {
    fontSize: u(2.1),
    fontWeight: 600,
    letterSpacing: '0.14em',
    color: pal.label,
    textTransform: 'uppercase',
    marginTop: u(1.5),
    textAlign: 'center',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    fontFamily: FONT_SANS,
  };

  const Diamond = () => (
    <div
      style={{
        width: u(1.3),
        height: u(1.3),
        background: pal.goldSolid,
        transform: 'rotate(45deg)',
        flex: '0 0 auto',
      }}
    />
  );

  return (
    <>
      {/* Latar */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: u(7), overflow: 'hidden' }}>
        <svg
          viewBox={`0 0 ${wn} ${hn}`}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, display: 'block' }}
        >
          <defs>
            <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="0.7" y2="1">
              <stop offset="0%" stopColor={pal.bgB} />
              <stop offset="100%" stopColor={pal.bgA} />
            </linearGradient>
            <radialGradient id={`gl-${uid}`} cx="50%" cy="17%" r="58%">
              <stop offset="0%" stopColor={pal.glow} />
              <stop offset="100%" stopColor={pal.glow} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={`gd-${uid}`} x1="0" y1="0" x2="1" y2="1">
              {pal.gold.map((c, i) => (
                <stop key={i} offset={`${(i / (pal.gold.length - 1)) * 100}%`} stopColor={c} />
              ))}
            </linearGradient>
          </defs>
          <rect width={wn} height={hn} fill={`url(#bg-${uid})`} />
          <rect width={wn} height={hn} fill={`url(#gl-${uid})`} />

          {/* Aksen 4 warna Google */}
          {(pal.accent || 'wedge') === 'wedge' && (
            <>
              <path d={`M0,0 H${R} Q${R * K},${R * K} 0,${R} Z`} fill="#4285F4" />
              <path d={`M${wn},0 H${wn - R} Q${wn - R * K},${R * K} ${wn},${R} Z`} fill="#EA4335" />
              <path d={`M0,${hn} H${R} Q${R * K},${hn - R * K} 0,${hn - R} Z`} fill="#34A853" />
              <path d={`M${wn},${hn} H${wn - R} Q${wn - R * K},${hn - R * K} ${wn},${hn - R} Z`} fill="#FBBC05" />
            </>
          )}
          {pal.accent === 'bar' && (
            <>
              <rect x="0" y={hn - 2.6} width={wn / 4 + 0.1} height="2.6" fill="#4285F4" />
              <rect x={wn / 4} y={hn - 2.6} width={wn / 4 + 0.1} height="2.6" fill="#EA4335" />
              <rect x={wn / 2} y={hn - 2.6} width={wn / 4 + 0.1} height="2.6" fill="#FBBC05" />
              <rect x={(wn * 3) / 4} y={hn - 2.6} width={wn / 4} height="2.6" fill="#34A853" />
            </>
          )}

          {/* Garis emas ganda */}
          <rect
            x="3.2"
            y="3.2"
            width={wn - 6.4}
            height={hn - 6.4}
            rx="4.2"
            fill="none"
            stroke={pal.dash ? pal.goldSolid : `url(#gd-${uid})`}
            strokeWidth={pal.dash ? 0.55 : 0.45}
            strokeDasharray={pal.dash ? '1.6 1.1' : undefined}
            strokeLinecap="round"
          />
          <rect
            x="5.2"
            y="5.2"
            width={wn - 10.4}
            height={hn - 10.4}
            rx="3"
            fill="none"
            stroke={`url(#gd-${uid})`}
            strokeWidth="0.15"
            opacity="0.55"
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${pal.gloss} 0%, rgba(255,255,255,0) 38%)`,
          }}
        />
      </div>

      {/* Logo G dengan cincin emas */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: u(6),
          width: u(25),
          height: u(25),
          transform: 'translateX(-50%)',
          borderRadius: '50%',
          padding: u(0.7),
          boxSizing: 'border-box',
          background: goldCss,
          boxShadow: `0 ${u(0.8)} ${u(2.4)} rgba(0,0,0,0.35)`,
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: '#fff',
            padding: u(4.2),
            boxSizing: 'border-box',
          }}
        >
          <GoogleG />
        </div>
      </div>

      {/* Konten */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: u(34),
          paddingBottom: u(6.5),
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            fontFamily: FONT_SANS,
            fontSize: u(2.5),
            fontWeight: 600,
            letterSpacing: '0.26em',
            textTransform: 'uppercase',
            color: pal.sub,
            lineHeight: 1.3,
            paddingLeft: '0.26em',
          }}
        >
          Bantu Kami Dengan
        </div>
        <div
          style={{
            fontFamily: FONT_SERIF,
            fontSize: u(8),
            fontWeight: 700,
            color: pal.text,
            lineHeight: 1.12,
            letterSpacing: '0.005em',
            whiteSpace: 'nowrap',
            marginTop: u(0.6),
          }}
        >
          Google Review
        </div>
        <div style={{ width: u(26), height: u(4.8), marginTop: u(1.2) }}>
          <GoldStars uid={uid} stops={pal.stars || GOLD_STOPS} />
        </div>

        {/* NFC | ATAU | QR */}
        <div
          style={{
            flex: 1,
            width: '100%',
            maxWidth: u(78),
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            padding: `0 ${u(4)}`,
            boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: u(23), height: u(25.5), display: 'flex', alignItems: 'center' }}>
              <NfcPhoneIcon stroke={pal.iconStroke} fill={pal.iconFill} textFill={pal.iconStroke} />
            </div>
            <div style={label}>Tempelkan HP</div>
          </div>

          <div
            style={{
              alignSelf: 'center',
              width: u(8),
              height: u(27),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1, width: hair, background: goldLineH('180deg') }} />
            <span
              style={{
                fontFamily: FONT_SANS,
                fontSize: u(2.1),
                fontWeight: 600,
                letterSpacing: '0.12em',
                color: pal.sub,
                padding: `${u(1)} 0`,
              }}
            >
              ATAU
            </span>
            <div style={{ flex: 1, width: hair, background: goldLineH('0deg') }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                padding: u(1.5),
                background: '#fff',
                borderRadius: u(2.6),
                boxShadow: `0 0 0 ${u(0.45)} ${pal.goldSolid}, 0 ${u(1)} ${u(2.6)} rgba(0,0,0,0.35)`,
              }}
            >
              {error ? (
                <div
                  style={{
                    width: u(22.5),
                    height: u(22.5),
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
              ) : qr ? (
                <img src={qr} alt={alt} style={{ width: u(22.5), height: u(22.5), objectFit: 'contain', display: 'block' }} />
              ) : (
                <div style={{ width: u(22.5), height: u(22.5), background: '#f1f5f9' }} />
              )}
            </div>
            <div style={label}>Scan QR</div>
          </div>
        </div>

        {/* Nama toko */}
        {name && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: u(58),
              gap: u(2.2),
              marginTop: u(1),
            }}
          >
            <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: u(12), height: hair, background: goldLineH('90deg') }} />
            <Diamond />
            <span
              style={{
                flex: '0 1 auto',
                minWidth: 0,
                fontFamily: FONT_SERIF,
                fontSize: u(nameFont),
                fontWeight: 600,
                color: pal.name,
                lineHeight: 1.25,
                letterSpacing: '0.03em',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {name}
            </span>
            <Diamond />
            <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: u(12), height: hair, background: goldLineH('270deg') }} />
          </div>
        )}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  KOMPONEN UTAMA                                                     */
/* ------------------------------------------------------------------ */
export default function QrCodeCard({ client, demo = false }) {
  const [url, setUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [theme, setTheme] = useState('classic'); // tampilan awal: Google Klasik
  const [showThemes, setShowThemes] = useState(false); // daftar tema tertutup secara default
  const [showName, setShowName] = useState(true); // tampilkan nama usaha di papan (ikut ke PNG/SVG/cetak)

  // Ukuran cetak (cm). Disimpan sebagai teks supaya enak diketik.
  const [showPrint, setShowPrint] = useState(false);
  const [widthCm, setWidthCm] = useState('10');
  const [heightCm, setHeightCm] = useState('10');
  const lastValid = useRef({ w: 10, h: 10 });

  const cardRef = useRef(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  // Lebar papan di layar menyesuaikan lebar kartu, supaya tidak meluber di HP kecil
  const wrapRef = useRef(null);
  const [previewMax, setPreviewMax] = useState(PREVIEW_MAX);
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const update = () => {
      const avail = el.clientWidth - 32 - 20; // padding kartu (p-4) + padding papan (10 x 2)
      setPreviewMax(Math.max(200, Math.min(PREVIEW_MAX, Math.floor(avail))));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [client?.slug]);

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
  const { w: printW, h: printH } = lastValid.current;

  /* ---------- Dimensi papan di layar ---------- */
  const longest = Math.max(printW, printH);
  const wPx = (previewMax * printW) / longest;
  const hPx = (previewMax * printH) / longest;
  const s = Math.min(wPx, hPx) / 100; // 1 unit desain = 1% sisi terpendek
  const wn = wPx / s;
  const hn = hPx / s;
  const u = (n) => `${(n * s).toFixed(3)}px`;

  const exceedsA4 = printW > A4_W || printH > A4_H;
  const fmt = (n) => String(Math.round(n * 10) / 10).replace('.', ',');

  const pal = THEMES[theme] || THEMES.classic;
  const boardBg = pal.kind === 'premium' ? pal.bgA : '#fff';

  /* ---------- Download ---------- */
  const downloadPng = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 150));
      const dataUrl = await toPng(cardRef.current, {
        quality: 0.95,
        pixelRatio: (4 * PREVIEW_MAX) / previewMax, // hasil unduhan/cetak tetap beresolusi sama
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
        pixelRatio: (4 * PREVIEW_MAX) / previewMax, // hasil unduhan/cetak tetap beresolusi sama
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

  const inputCls =
    'w-16 rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700 text-center';

  const boardProps = {
    u,
    s,
    wn,
    hn,
    qr: qrCodeDataUrl,
    error,
    name: showName ? client.name : '',
    alt: `QR Code ${client.name}`,
  };

  return (
    <div ref={wrapRef} className={`flex flex-col items-center gap-4 p-4 border rounded-2xl shadow-sm w-full ${demo ? 'bg-slate-900/60 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
      {/* TEMPLATE STANDEE */}
      <div className="my-2" style={{ padding: 10 }}>
        <div
          ref={cardRef}
          style={{
            position: 'relative',
            width: wPx,
            height: hPx,
            borderRadius: u(7),
            boxShadow: `0 ${u(2.5)} ${u(4)} -${u(1)} rgba(0,0,0,0.35)`,
            fontFamily: FONT_SANS,
            background: boardBg,
          }}
        >
          {pal.kind === 'premium' ? (
            <PremiumBoard pal={pal} uid={uid} {...boardProps} />
          ) : (
            <ClassicBoard {...boardProps} />
          )}
        </div>
      </div>

      {/* Nama klien & URL (tidak ikut ter-export / tercetak). Di landing page nama sudah ada di papan. */}
      {!demo && (
        <div className="w-full px-1 text-center">
          <div className="mb-2 flex items-center justify-center gap-1.5" aria-hidden="true">
            {['#4285F4', '#EA4335', '#FBBC05', '#34A853'].map((c) => (
              <span key={c} className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-300" />
            <p className="max-w-[70%] truncate text-base font-semibold text-slate-800" style={{ fontFamily: FONT_SERIF }}>
              {client.name}
            </p>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-300" />
          </div>
          <p className="mt-1 break-all font-mono text-[11px] text-slate-400">{url}</p>
        </div>
      )}

      {/* PILIH TEMA (bisa dibuka/tutup) */}
      <div className="w-full">
        <button
          type="button"
          onClick={() => setShowThemes((v) => !v)}
          aria-expanded={showThemes}
          aria-controls={`themes-${uid}`}
          className={`flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition-colors ${demo ? 'border-white/15 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-white hover:bg-slate-100'}`}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className="inline-block h-4 w-4 shrink-0 rounded-full border border-slate-300"
              style={{ background: THEMES[theme]?.swatch }}
            />
            <span className={`truncate text-xs font-bold ${demo ? 'text-slate-300' : 'text-slate-700'}`}>
              Tema desain: <span className={demo ? 'text-white' : 'text-slate-900'}>{THEMES[theme]?.title}</span>
            </span>
          </span>
          <span className={`flex shrink-0 items-center gap-1 text-[11px] font-semibold ${demo ? 'text-slate-400' : 'text-slate-500'}`}>
            {showThemes ? 'Tutup' : `Ganti (${THEME_KEYS.length})`}
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${showThemes ? 'rotate-180' : ''}`}
            />
          </span>
        </button>

        <div
          id={`themes-${uid}`}
          aria-hidden={!showThemes}
          className={`grid transition-[grid-template-rows] duration-300 ease-out ${
            showThemes ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-wrap gap-1.5 pt-2">
              {THEME_KEYS.map((k) => {
                const active = theme === k;
                return (
                  <button
                    key={k}
                    type="button"
                    tabIndex={showThemes ? 0 : -1}
                    onClick={() => setTheme(k)}
                    aria-pressed={active}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                      active
                        ? demo
                          ? 'border-amber-500 bg-amber-500/15 text-white ring-2 ring-amber-500/30'
                          : 'border-amber-500 bg-amber-50 text-slate-900 ring-2 ring-amber-200'
                        : demo
                          ? 'border-white/15 text-slate-300 hover:bg-white/10'
                          : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className="inline-block w-3.5 h-3.5 rounded-full border border-slate-300"
                      style={{ background: THEMES[k].swatch }}
                    />
                    {THEMES[k].title}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* OPSI: NAMA USAHA DI PAPAN */}
      <button
        type="button"
        role="switch"
        aria-checked={showName}
        onClick={() => setShowName((v) => !v)}
        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
          demo ? 'border-white/15 bg-white/5 hover:bg-white/10' : 'border-slate-300 bg-white hover:bg-slate-100'
        }`}
      >
        <span className="min-w-0">
          <span className={`block text-xs font-bold ${demo ? 'text-slate-300' : 'text-slate-700'}`}>
            Tampilkan nama usaha di papan
          </span>
          <span className={`block text-[11px] leading-snug ${demo ? 'text-slate-400' : 'text-slate-500'}`}>
            {showName ? 'Nama ikut tampil di bagian bawah papan' : 'Papan tanpa nama, siap dicetak untuk usaha apa pun'}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${
            showName ? 'bg-amber-500' : demo ? 'bg-white/20' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
              showName ? 'left-[18px]' : 'left-0.5'
            }`}
          />
        </span>
      </button>

      {/* PENGATURAN UKURAN CETAK */}
      {showPrint && !demo && (
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
      {!demo && (
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
      )}
    </div>
  );
}