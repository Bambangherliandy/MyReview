'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star, Coffee, Smartphone, PenLine, BarChart3, Zap, MessageCircle, TrendingUp,
  BadgeCheck, QrCode, SlidersHorizontal, UtensilsCrossed, Scissors, BedDouble,
  Store, Dumbbell, Check, X, Menu, ChevronDown, Plus, Globe,
  ZoomIn, ChevronLeft, ChevronRight,
} from 'lucide-react';
import Logo from "@/components/logo";
import StandeeShowcase from '@/components/StandeShowcase';

const WA_NUMBER = '6285129126104';
const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

// Nama tetap untuk demo papan QR di hero (tidak diambil dari database, tidak ikut bahasa)
const DEMO_CARD_NAME = 'MyReview';

// Link ulasan Google untuk demo (place ID contoh dari Google)
const DEMO_GOOGLE_URL = 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDe1EmsRUsoyG83frY4';

// Foto galeri (file ada di public/gallery). w/h = ukuran asli gambar.
const GALLERY = [
  { src: '/gallery/gambar-6.jpg', w: 768, h: 1365 },
  { src: '/gallery/cafe-1.webp', w: 768, h: 1365 },
  { src: '/gallery/gambar-7.jpg', w: 896, h: 1194 },
  { src: '/gallery/cafe-2.webp', w: 896, h: 1194 },
  { src: '/gallery/cafe-3.webp', w: 768, h: 1365 },
  { src: '/gallery/cafe-4.webp', w: 912, h: 1170 },
  { src: '/gallery/gambar-1.jpg', w: 896, h: 1194 },
  
];
// Set ke false setelah foto di atas diganti dengan foto asli di kafe klien
// (catatan "ilustrasi visual" di bawah galeri otomatis hilang).
const GALLERY_IS_ILLUSTRATION = true;

// Isi dengan testimoni ASLI dari klien. Bagian testimoni otomatis tersembunyi selama daftar ini kosong.
// Bentuk data: { quote: 'Isi testimoni', name: 'Nama', role: 'Pemilik Kopi X' }
const TESTIMONIALS = [];

const NAV_HREFS = ['#cara-kerja', '#desain', '#fitur', '#harga', '#faq'];
const STEP_ICONS = [Smartphone, Star, PenLine, BarChart3];
const FEATURE_ICONS = [Zap, MessageCircle, TrendingUp, BadgeCheck, QrCode, SlidersHorizontal];
const AUDIENCE_ICONS = [Coffee, UtensilsCrossed, Scissors, BedDouble, Store, Dumbbell];

// ---------------------------------------------------------------
// TERJEMAHAN / TRANSLATIONS
// ---------------------------------------------------------------
const My = () => <span style={{ color: '#F59E0B' }}>My</span>;
const T = {
  id: {
    nav: ['Cara Kerja', 'Desain', 'Fitur', 'Harga', 'FAQ'],
    login: 'Login', loginClient: 'Login Klien', loginClientSub: 'Untuk pemilik kafe / usaha',
    loginAdmin: 'Login Admin', loginAdminSub: 'Khusus tim MyReview', tryDemo: 'Coba Demo', closeMenu: 'Tutup menu',
    heroBadge: 'Solusi Ulasan Google Maps untuk Bisnis Lokal',
    heroTitle1: 'Dapatkan Lebih Banyak Ulasan Google, ', heroTitle2: 'Cukup Sekali Scan',
    heroText: 'Pelanggan scan QR di meja, pilih bintang, lalu langsung menulis ulasan di Google Maps atau mengirim masukan ke WhatsApp pemilik. Mudah bagi pelanggan, terukur bagi kamu.',
    ctaOrder: 'Pesan Papan QR Sekarang', ctaSim: 'Simulasi Sistem',
    phoneAsk: 'Bagaimana pengalaman Anda hari ini?', google: 'Tulis ulasan di Google', wa: 'Kirim masukan via WhatsApp',
    stats: [['Tanpa', 'install aplikasi'], ['1 ketukan', 'untuk memberi rating'], ['Sekali bayar', 'tanpa langganan'], ['24/7', 'QR aktif di meja']],
    problemTitle: 'Kenapa Ulasan Sulit Didapat?',
    withoutTitle: 'Tanpa MyReview',
    without: ['Pelanggan harus membuka Maps dan mencari nama tempat sendiri', 'Banyak pelanggan puas pulang tanpa memberi ulasan', 'Tidak ada data berapa orang yang benar-benar tertarik memberi ulasan', 'Keluhan sulit sampai ke pemilik secara langsung'],
    withTitle: 'Dengan MyReview',
    withList: ['Scan QR, pilih bintang, langsung ke dialog ulasan Google', 'Prosesnya singkat sehingga lebih banyak pelanggan menyelesaikannya', 'Scan dan aksi pelanggan tercatat di dashboard', 'Jalur WhatsApp tersedia untuk masukan langsung'],
    proofTitle: 'Dipercaya Pemilik Usaha',
    howTitle: <>Cara Kerja <My />Review</>, howSub: 'Empat langkah sederhana, dari meja sampai dashboard',
    steps: [
      { title: 'Pelanggan scan QR', text: 'QR ada di meja atau kasir. Tanpa install aplikasi, langsung terbuka di browser HP.' },
      { title: 'Pilih bintang', text: 'Pelanggan memberi rating 1–5 dalam satu ketukan.' },
      { title: 'Pilih cara berbagi', text: 'Tulis ulasan di Google atau kirim masukan langsung ke WhatsApp pemilik.' },
      { title: 'Pantau di dashboard', text: 'Jumlah scan, rata-rata rating, dan pilihan pelanggan tercatat otomatis.' },
    ],
    demoBadge: 'Demo Interaktif', demoTitle: 'Cobalah Simulasi Scan Pelanggan',
    demoSub: 'Klik jumlah bintang untuk melihat apa yang akan dilihat pelangganmu:',
    demoVenue: 'Kafe Kenangan Kita', demoAsk: 'Bagaimana pengalaman kopi Anda hari ini?',
    demoThanks: 'Terima kasih! Pilih cara Anda ingin berbagi pengalaman:',
    demoWa: 'Kirim masukan ke pemilik via WhatsApp', demoSame: 'Semua rating mendapat dua pilihan yang sama.', demoRetry: 'Coba Lagi',
    demoWaMsg: (n) => `Halo Admin (Simulasi Demo MyReview),\nSaya mencoba demo dan memberi rating ${n}★.`,
    galleryTitle: 'Begini Tampilan Papan QR di Kafe',
    gallerySub: 'Akrilik bening dengan desain Google Review, siap dipasang di kasir, bar, atau meja pelanggan.',
    galleryCaps: ['bentuk card google review','Di meja kasir','di toko pakaian', 'Di counter kopi', 'Di rak display', 'Di bar barista', 'Di meja pelanggan'],
    heroFor: 'Cocok untuk', heroHint: 'Coba sendiri: ketuk salah satu bintang di papan.',
    galleryZoom: 'perbesar foto', galleryCta: 'Lihat Paket', galleryNote: '*Ilustrasi visual untuk gambaran penempatan papan',
    galleryClose: 'Tutup', galleryPrev: 'Foto sebelumnya', galleryNext: 'Foto berikutnya',
    featTitle: <>Kenapa Pemilik Bisnis Menyukai <My />Review?</>,
    features: [
      { title: 'Ulasan Jadi Lebih Mudah', text: 'Pelanggan langsung dibawa ke dialog tulis ulasan Google tanpa mencari nama tempat.' },
      { title: 'Saluran Masukan Pribadi', text: 'Pelanggan yang ingin menyampaikan keluhan secara langsung punya jalur WhatsApp ke pemilik.' },
      { title: 'Statistik Real-time', text: 'Lihat total scan, rata-rata rating, dan aksi pelanggan per lokasi.' },
      { title: 'Halaman Sesuai Brand', text: 'Logo dan nama usaha tampil di halaman rating, lengkap dengan alamat unik per kafe.' },
      { title: 'Papan QR Akrilik', text: 'Papan meja elegan yang siap dipasang, tahan lama, dan mudah dibersihkan.' },
      { title: 'Atur Sendiri', text: 'Ubah link ulasan dan nomor WhatsApp kapan saja tanpa mencetak ulang QR.' },
    ],
    dashTag: 'Dashboard Klien', dashTitle: 'Pantau Semuanya dalam Satu Layar',
    dashText: 'Login sebagai klien untuk melihat jumlah scan, rata-rata rating, dan berapa pelanggan yang memilih menulis ulasan di Google atau mengirim masukan via WhatsApp.',
    dashBtn: 'Masuk ke Dashboard Klien',
    dashStats: [['Total Scan', '1.248'], ['Rating Rata-rata', '4,7'], ['Ke Google', '812']],
    dashNote: '*Contoh tampilan, bukan data sebenarnya',
    audTitle: 'Cocok untuk berbagai jenis usaha',
    audience: ['Kafe & Kedai Kopi', 'Restoran', 'Salon & Barbershop', 'Hotel & Homestay', 'Toko & Butik', 'Gym & Studio'],
    priceTitle: <>Paket Penawaran <My />Review</>, priceSub: 'Pilih paket yang sesuai dengan jumlah meja usaha kamu', once: '/ sekali bayar',
    starter: { name: 'Starter Pack', desc: 'Cocok untuk Kafe Kecil / Kedai Kopi', per: 'setara Rp 30.000 / papan', items: ['5 Papan Akrilik Meja High Quality', 'QR Code & Sistem MyReview Aktif', 'Bebas Atur Link Ulasan & WA', 'Tanpa Biaya Langganan Bulanan'], cta: 'Pesan Paket Starter', wa: 'Halo Admin MyReview, saya tertarik pesan Paket Starter' },
    pro: { name: 'Pro Business', desc: 'Cocok untuk Restoran & Kafe Besar', badge: 'Paling Populer', per: 'setara ±Rp 23.300 / papan', save: 'Hemat ±22% per papan dibanding Starter', items: ['15 Papan Akrilik Meja Custom Logo', 'QR Code & Sistem MyReview Aktif', 'Laporan Statistik Scan Bulanan', 'Support & Garansi Papan Akrilik'], cta: 'Pesan Paket Pro', wa: 'Halo Admin MyReview, saya tertarik pesan Paket Pro Business' },
    orderTitle: 'Setelah Kamu Memesan',
    orderSteps: [
      { title: 'Kirim data usaha', text: 'Hubungi kami via WhatsApp, kirim nama usaha, dan pilih desain papan.' },
      { title: 'Halaman & QR aktif', text: 'Kami siapkan halaman rating dan QR untuk usahamu.' },
      { title: 'Papan dicetak & dikirim', text: 'Papan akrilik dicetak sesuai desain pilihanmu, lalu siap dipasang.' },
    ],
    faqTitle: 'Pertanyaan yang Sering Diajukan',
    faqs: [
      { q: 'Apakah pelanggan perlu install aplikasi?', a: 'Tidak. Pelanggan cukup scan QR dengan kamera HP dan halaman terbuka langsung di browser.' },
      { q: 'Apakah rating bintang otomatis terisi di Google?', a: 'Google tidak mengizinkan hal itu. Pelanggan akan dibawa langsung ke dialog tulis ulasan, lalu memilih bintang sekali lagi dan menekan Posting.' },
      { q: 'Apakah semua pelanggan diarahkan ke Google?', a: 'Ya, semua pelanggan mendapat pilihan yang sama: menulis ulasan di Google atau mengirim masukan via WhatsApp. Cara ini sejalan dengan kebijakan ulasan Google.' },
      { q: 'Bagaimana kalau link ulasan atau nomor WhatsApp berubah?', a: 'Cukup diubah lewat dashboard. QR code yang sudah dicetak tetap berfungsi.' },
      { q: 'Apakah ada biaya langganan bulanan?', a: 'Tidak untuk paket yang tertera. Pembayaran sekali bayar sesuai paket.' },
      { q: 'Berapa lama pemasangan sampai bisa dipakai?', a: 'Setelah data usaha kamu kami terima, halaman rating dan QR bisa aktif dengan cepat. Papan akrilik menyusul sesuai proses cetak.' },
    ],
    finalTitle: 'Siap Menambah Ulasan untuk Usahamu?', finalText: 'Hubungi kami, kirim data usahamu, dan QR bisa segera terpasang di meja.',
    finalBtn: 'Konsultasi via WhatsApp', finalWa: 'Halo Admin MyReview, saya ingin konsultasi',
    rights: '© 2026 MyReview. Hak cipta dilindungi.',
  },

  en: {
    nav: ['How It Works', 'Designs', 'Features', 'Pricing', 'FAQ'],
    login: 'Login', loginClient: 'Client Login', loginClientSub: 'For cafe / business owners',
    loginAdmin: 'Admin Login', loginAdminSub: 'MyReview team only', tryDemo: 'Try Demo', closeMenu: 'Close menu',
    heroBadge: 'Google Maps Review Solution for Local Businesses',
    heroTitle1: 'Get More Google Reviews, ', heroTitle2: 'With a Single Scan',
    heroText: 'Customers scan the QR at their table, pick a star rating, then write a review on Google Maps or send feedback to the owner on WhatsApp. Easy for customers, measurable for you.',
    ctaOrder: 'Order QR Stands Now', ctaSim: 'Try the Simulation',
    phoneAsk: 'How was your experience today?', google: 'Write a review on Google', wa: 'Send feedback via WhatsApp',
    stats: [['No', 'app to install'], ['1 tap', 'to leave a rating'], ['One-time fee', 'no subscription'], ['24/7', 'QR live on your table']],
    problemTitle: 'Why Are Reviews So Hard to Get?',
    withoutTitle: 'Without MyReview',
    without: ['Customers have to open Maps and search for your place themselves', 'Many happy customers leave without writing a review', 'No data on how many people were actually willing to review', 'Complaints rarely reach the owner directly'],
    withTitle: 'With MyReview',
    withList: ['Scan the QR, pick a rating, land right on the Google review dialog', 'A short process means more customers finish it', 'Scans and customer actions are tracked on your dashboard', 'A WhatsApp channel is available for direct feedback'],
    proofTitle: 'Trusted by Business Owners',
    howTitle: <>How <My />Review Works</>, howSub: 'Four simple steps, from the table to the dashboard',
    steps: [
      { title: 'Customer scans the QR', text: 'The QR sits on the table or at the counter. No app needed, it opens right in the phone browser.' },
      { title: 'Pick a rating', text: 'Customers give a 1–5 star rating with a single tap.' },
      { title: 'Choose how to share', text: 'Write a review on Google or send feedback straight to the owner on WhatsApp.' },
      { title: 'Track on the dashboard', text: 'Scan counts, average rating, and customer choices are recorded automatically.' },
    ],
    demoBadge: 'Interactive Demo', demoTitle: 'Try a Customer Scan Simulation',
    demoSub: 'Tap a star rating to see what your customers will see:',
    demoVenue: 'Kenangan Kita Café', demoAsk: 'How was your coffee today?',
    demoThanks: 'Thank you! Choose how you would like to share your experience:',
    demoWa: 'Send feedback to the owner via WhatsApp', demoSame: 'Every rating gets the same two options.', demoRetry: 'Try Again',
    demoWaMsg: (n) => `Hello MyReview Admin (Demo Simulation),\nI tried the demo and gave a ${n}★ rating.`,
    galleryTitle: 'How the QR Stand Looks in a Cafe',
    gallerySub: 'Clear acrylic with a Google Review design, ready for the counter, the bar, or customer tables.',
    galleryCaps: ['Google Review card format','At the cashier','at the clothing store', 'At the coffee counter', 'On the display shelf', 'At the barista bar', 'On the customer table'],
    heroFor: 'Perfect for', heroHint: 'Try it yourself: tap a star on the stand.',
    galleryZoom: 'enlarge photo', galleryCta: 'See Packages', galleryNote: '*Visual illustration to show stand placement',
    galleryClose: 'Close', galleryPrev: 'Previous photo', galleryNext: 'Next photo',
    featTitle: <>Why Business Owners Love <My />Review</>,
    features: [
      { title: 'Reviews Made Easier', text: 'Customers go straight to the Google review dialog without searching for your place.' },
      { title: 'A Private Feedback Channel', text: 'Customers who want to share a concern directly have a WhatsApp line to the owner.' },
      { title: 'Real-time Statistics', text: 'See total scans, average rating, and customer actions for each location.' },
      { title: 'Your Own Branded Page', text: 'Your logo and business name appear on the rating page, with a unique address for each cafe.' },
      { title: 'Acrylic QR Stands', text: 'Elegant table stands that are ready to place, durable, and easy to clean.' },
      { title: 'Update It Yourself', text: 'Change the review link and WhatsApp number anytime without reprinting the QR.' },
    ],
    dashTag: 'Client Dashboard', dashTitle: 'Track Everything on One Screen',
    dashText: 'Log in as a client to see scan counts, average rating, and how many customers chose to write a Google review or send feedback via WhatsApp.',
    dashBtn: 'Go to Client Dashboard',
    dashStats: [['Total Scans', '1,248'], ['Average Rating', '4.7'], ['To Google', '812']],
    dashNote: '*Sample view, not real data',
    audTitle: 'Great for many types of business',
    audience: ['Cafes & Coffee Shops', 'Restaurants', 'Salons & Barbershops', 'Hotels & Homestays', 'Shops & Boutiques', 'Gyms & Studios'],
    priceTitle: <><My />Review Packages</>, priceSub: 'Choose the package that fits the number of tables in your business', once: '/ one-time',
    starter: { name: 'Starter Pack', desc: 'Great for small cafes / coffee shops', per: 'about Rp 30,000 per stand', items: ['5 High Quality Acrylic Table Stands', 'QR Code & MyReview System Activated', 'Set Your Own Review Link & WhatsApp', 'No Monthly Subscription Fee'], cta: 'Order Starter Pack', wa: 'Hello MyReview Admin, I am interested in the Starter Pack' },
    pro: { name: 'Pro Business', desc: 'Great for restaurants & larger cafes', badge: 'Most Popular', per: 'about Rp 23,300 per stand', save: 'Save ~22% per stand vs Starter', items: ['15 Acrylic Table Stands with Custom Logo', 'QR Code & MyReview System Activated', 'Monthly Scan Statistics Report', 'Support & Acrylic Stand Warranty'], cta: 'Order Pro Package', wa: 'Hello MyReview Admin, I am interested in the Pro Business package' },
    orderTitle: 'After You Order',
    orderSteps: [
      { title: 'Send your details', text: 'Message us on WhatsApp, send your business name, and pick a stand design.' },
      { title: 'Page & QR go live', text: 'We set up the rating page and QR for your business.' },
      { title: 'Stands printed & shipped', text: 'Acrylic stands are printed in the design you chose, then ready to place.' },
    ],
    faqTitle: 'Frequently Asked Questions',
    faqs: [
      { q: 'Do customers need to install an app?', a: 'No. Customers just scan the QR with their phone camera and the page opens right in the browser.' },
      { q: 'Does the star rating fill in automatically on Google?', a: 'Google does not allow that. Customers are taken straight to the review dialog, then pick their stars once more and tap Post.' },
      { q: 'Are all customers sent to Google?', a: 'Yes, every customer gets the same choices: write a review on Google or send feedback via WhatsApp. This is in line with Google review policy.' },
      { q: 'What if the review link or WhatsApp number changes?', a: 'Just update it from the dashboard. QR codes that are already printed keep working.' },
      { q: 'Is there a monthly subscription fee?', a: 'Not for the packages listed. Payment is one-time per package.' },
      { q: 'How long until it is ready to use?', a: 'Once we receive your business details, the rating page and QR can go live quickly. Acrylic stands follow based on printing time.' },
    ],
    finalTitle: 'Ready to Get More Reviews for Your Business?', finalText: 'Contact us, send your business details, and your QR can be on the table soon.',
    finalBtn: 'Consult via WhatsApp', finalWa: 'Hello MyReview Admin, I would like a consultation',
    rights: '© 2026 MyReview. All rights reserved.',
  },
};

// ---------------------------------------------------------------
// KOMPONEN KECIL
// ---------------------------------------------------------------
function StarRow({ value = 5, size = 20, className = '' }) {
  return (
    <div className={`flex gap-0.5 ${className}`} role="img" aria-label={`${value}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= value ? 'fill-amber-400 text-amber-400' : 'fill-slate-700 text-slate-700'} />
      ))}
    </div>
  );
}

function LangSwitch({ lang, setLang, full = false }) {
  return (
    <div className={`inline-flex items-center gap-1 rounded-xl border border-white/15 bg-slate-900/60 p-1 ${full ? 'w-full justify-center' : ''}`}>
      <Globe size={14} className="ml-1.5 text-slate-400" />
      {['id', 'en'].map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase transition-colors ${
            lang === l ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function LoginMenu({ t }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="inline-flex items-center justify-center gap-1.5 border border-white/15 bg-slate-900/60 hover:bg-white/10 text-slate-200 font-medium px-5 py-2.5 rounded-xl text-sm transition-all"
      >
        {t.login} <ChevronDown size={16} />
      </button>
      {open && (
        <>
          <button type="button" aria-label={t.closeMenu} onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default" />
          {/* latar solid supaya isi halaman tidak tembus ke menu */}
          <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-white/10 bg-slate-900 p-2 shadow-2xl shadow-black/50">
            <Link href="/login" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-left hover:bg-amber-500/10">
              <span className="block text-sm font-semibold text-white">{t.loginClient}</span>
              <span className="block text-xs text-slate-400">{t.loginClientSub}</span>
            </Link>
            <Link href="/admin/login" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-left hover:bg-amber-500/10">
              <span className="block text-sm font-semibold text-white">{t.loginAdmin}</span>
              <span className="block text-xs text-slate-400">{t.loginAdminSub}</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------
// HERO: PAPAN INTERAKTIF
// ---------------------------------------------------------------
function GoogleG() {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

const BURST_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#34A853'];

// Papan Google Klasik (sama dengan tema "Google Klasik" di StandeeBoard): bingkai 4 warna
// dengan lengkungan, kartu putih, ikon NFC, QR, dan nama usaha. Semua ukuran memakai
// satuan cqw (1 = 1% lebar papan) sehingga skalanya selalu proporsional.
function HeroStand({ qr, rating, onRate }) {
  const [hover, setHover] = useState(0);
  const [burst, setBurst] = useState(null);
  const standRef = useRef(null);
  const filled = hover || rating || 5;
  const u = (n) => `${n}cqw`;
  const hair = 'max(1px, 0.25cqw)';

  const onMove = (e) => {
    const el = standRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--gx', `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
    el.style.setProperty('--gy', `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
  };
  const onLeave = () => {
    const el = standRef.current;
    if (!el) return;
    el.style.setProperty('--gx', '22%');
    el.style.setProperty('--gy', '14%');
  };
  const tap = (i) => {
    setBurst({ i, key: Date.now() });
    onRate(i);
  };

  return (
    <div className="relative mx-auto w-full max-w-[400px]" style={{ perspective: '1100px' }}>
      <div aria-hidden="true" className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-amber-500/20 blur-3xl" />

      <div
        ref={standRef}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        className="mr-tilt"
        style={{ transformStyle: 'preserve-3d', transform: 'rotateY(calc(var(--px, 0) * 18deg)) rotateX(calc(var(--py, 0) * -12deg))', transition: 'transform .2s ease-out' }}
      >
        <div className="mr-float">
          <div className="relative">
            {/* pelat akrilik bening di belakang papan */}
            <div aria-hidden="true" className="absolute -inset-2 rounded-[9.5%] bg-white/20 ring-1 ring-white/50 backdrop-blur-[2px]" />

            <div
              className="relative aspect-square w-full overflow-hidden shadow-[0_35px_60px_-25px_rgba(0,0,0,0.7)]"
              style={{ borderRadius: '7%', containerType: 'inline-size', fontFamily: 'var(--font-poppins, Poppins), Arial, sans-serif' }}
            >
              {/* bingkai 4 warna melengkung */}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}>
                <path d="M0,0 H50 V44 H10 C7,44.5 5,49 0,49 Z" fill="#4285F4" stroke="#4285F4" strokeWidth="0.4" />
                <path d="M50,0 H100 V49 C95,49 93,44.5 90,44 H50 Z" fill="#EA4335" stroke="#EA4335" strokeWidth="0.4" />
                <path d="M0,49 C5,49 7,44.5 10,44 H50 V85 C50,92 52,97 56,100 H0 Z" fill="#34A853" stroke="#34A853" strokeWidth="0.4" />
                <path d="M100,49 C95,49 93,44.5 90,44 H50 V85 C50,92 52,97 56,100 H100 Z" fill="#FBBC05" stroke="#FBBC05" strokeWidth="0.4" />
              </svg>
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 35%, rgba(0,0,0,0.03) 100%)' }} />
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, borderRadius: '7%', boxShadow: `inset 0 0 0 ${u(0.7)} rgba(255,255,255,0.55)` }} />

              {/* logo G */}
              <div style={{ position: 'absolute', left: '50%', top: u(4.5), width: u(29), height: u(29), transform: 'translateX(-50%)', background: '#fff', borderRadius: '50%', padding: u(4.2), boxSizing: 'border-box', boxShadow: `0 ${u(0.4)} ${u(1.4)} rgba(0,0,0,0.25)`, zIndex: 2 }}>
                <GoogleG />
              </div>

              {/* nama usaha: menyatu dengan bingkai */}
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: u(3.6), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: u(2), padding: `0 ${u(9)}`, boxSizing: 'border-box', zIndex: 2 }}>
                <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: u(14), height: hair, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.9))' }} />
                <div style={{ width: u(1.3), height: u(1.3), background: '#fff', transform: 'rotate(45deg)', flex: '0 0 auto' }} />
                <span style={{ flex: '0 1 auto', minWidth: 0, fontFamily: 'var(--font-playfair, "Playfair Display"), Georgia, "Times New Roman", serif', fontSize: u(4.4), fontWeight: 600, color: '#fff', letterSpacing: '0.05em', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: `0 ${u(0.3)} ${u(0.9)} rgba(0,0,0,0.35)` }}>
                  {DEMO_CARD_NAME}
                </span>
                <div style={{ width: u(1.3), height: u(1.3), background: '#fff', transform: 'rotate(45deg)', flex: '0 0 auto' }} />
                <div style={{ flex: '1 1 0', minWidth: 0, maxWidth: u(14), height: hair, background: 'linear-gradient(270deg, rgba(255,255,255,0), rgba(255,255,255,0.9))' }} />
              </div>

              {/* kartu putih */}
              <div style={{ position: 'absolute', left: u(10), right: u(10), top: u(19), bottom: u(15), background: '#fff', borderRadius: u(3.6), display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: u(15), boxSizing: 'border-box', boxShadow: `0 ${u(0.3)} ${u(1)} rgba(0,0,0,0.2)` }}>
                <div style={{ fontSize: u(3.3), fontWeight: 500, color: '#334155', lineHeight: 1.2 }}>Bantu Kami Dengan</div>
                <div style={{ fontSize: u(7.4), fontWeight: 800, color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>Google Review</div>

                {/* bintang yang bisa diketuk */}
                <div style={{ display: 'flex', margin: `${u(-0.4)} 0 ${u(-1)}` }} onPointerLeave={() => setHover(0)}>
                  {[1, 2, 3, 4, 5].map((i) => {
                    const on = i <= filled;
                    return (
                      <button
                        key={i}
                        type="button"
                        aria-label={`${i}/5`}
                        onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHover(i); }}
                        onClick={() => tap(i)}
                        className="relative cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                        style={{ padding: u(1.5), background: 'none', border: 0, lineHeight: 0 }}
                      >
                        <span className={rating === 0 && hover === 0 ? 'mr-wave' : ''} style={{ display: 'block', lineHeight: 0, animationDelay: `${i * 0.14}s` }}>
                          <Star style={{ width: u(5.4), height: u(5.4) }} fill={on ? '#F5B800' : '#E2E8F0'} stroke={on ? '#F5B800' : '#E2E8F0'} />
                        </span>
                        {burst && burst.i === i &&
                          Array.from({ length: 8 }).map((_, k) => {
                            const ang = (k / 8) * Math.PI * 2;
                            return (
                              <span
                                key={`${burst.key}-${k}`}
                                className="mr-burst"
                                style={{ position: 'absolute', left: '50%', top: '50%', width: u(1.6), height: u(1.6), borderRadius: '50%', background: BURST_COLORS[k % 4], '--dx': `${(Math.cos(ang) * 10).toFixed(2)}cqw`, '--dy': `${(Math.sin(ang) * 10).toFixed(2)}cqw` }}
                              />
                            );
                          })}
                      </button>
                    );
                  })}
                </div>

                <div style={{ flex: 1, width: '100%', maxWidth: u(80), display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: `0 ${u(4)} ${u(3)}`, boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: u(25) }}>
                      <svg viewBox="0 0 96 80" width="100%" fill="none" aria-hidden="true">
                        <rect x="46" y="4" width="34" height="68" rx="7" fill="#fff" stroke="#111827" strokeWidth="3" />
                        <rect x="57" y="9" width="12" height="3" rx="1.5" fill="#111827" />
                        <circle cx="63" cy="64" r="2.5" fill="#111827" />
                        <path d="M40 28c4 3.5 4 17 0 20.5" stroke="#111827" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="20" cy="40" r="17" fill="#fff" stroke="#111827" strokeWidth="3" />
                        <text x="20" y="44" textAnchor="middle" fontSize="11" fontWeight="900" fill="#111827" fontFamily="Arial, sans-serif">NFC</text>
                      </svg>
                    </div>
                    <div style={{ fontSize: u(2.6), fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', marginTop: u(1.4), textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap' }}>Tempelkan HP Kamu</div>
                  </div>

                  <div style={{ position: 'relative', alignSelf: 'center', width: u(8), height: u(30) }}>
                    <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 'max(1px, 0.25cqw)', background: '#cbd5e1' }} />
                    <span style={{ position: 'absolute', left: '50%', top: '18%', transform: 'translateX(-50%)', background: '#fff', padding: `${u(0.8)} ${u(0.6)}`, fontSize: u(2.4), fontWeight: 700, color: '#64748b' }}>ATAU</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {qr ? (
                      <img src={qr} alt="QR MyReview" style={{ width: u(23), height: u(23), objectFit: 'contain', display: 'block' }} />
                    ) : (
                      <div style={{ width: u(23), height: u(23), background: '#f1f5f9' }} />
                    )}
                    <div style={{ fontSize: u(2.6), fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', marginTop: u(1.4), textAlign: 'center', lineHeight: 1.2, whiteSpace: 'nowrap' }}>Scan QR</div>
                  </div>
                </div>
              </div>

              {/* kilau cahaya mengikuti kursor */}
              <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', background: 'radial-gradient(circle at var(--gx, 22%) var(--gy, 14%), rgba(255,255,255,0.30), rgba(255,255,255,0) 46%)' }} />
            </div>
          </div>
          <div aria-hidden="true" className="relative left-1/2 mt-2 h-5 w-[104%] -translate-x-1/2 rounded-b-2xl border border-white/60 bg-gradient-to-b from-white/60 to-white/10 shadow-lg backdrop-blur-sm" />
        </div>
      </div>
      <div aria-hidden="true" className="mx-auto mt-4 h-5 w-3/4 rounded-full bg-black/60 blur-xl" />
    </div>
  );
}

// ---------------------------------------------------------------
// HALAMAN UTAMA
// ---------------------------------------------------------------
export default function LandingPage() {
  const [lang, setLangState] = useState('id');
  const [demoRating, setDemoRating] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [wordIdx, setWordIdx] = useState(0);
  const [heroRating, setHeroRating] = useState(0);
  const [heroQr, setHeroQr] = useState('');
  const heroRef = useRef(null);
  const heroTimer = useRef(null);
  const touchX = useRef(null);
  const [showBar, setShowBar] = useState(false);

  // Hero interaktif: posisi kursor disimpan sebagai CSS variable (tanpa render ulang)
  const onHeroMove = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--px', (x - 0.5).toFixed(3));
    el.style.setProperty('--py', (y - 0.5).toFixed(3));
    el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
    el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
  };
  const onHeroLeave = () => {
    const el = heroRef.current;
    if (!el) return;
    el.style.setProperty('--px', '0');
    el.style.setProperty('--py', '0');
    el.style.setProperty('--mx', '70%');
    el.style.setProperty('--my', '30%');
  };
  const handleHeroRate = (n) => {
    setHeroRating(n);
    clearTimeout(heroTimer.current);
    heroTimer.current = setTimeout(() => setHeroRating(0), 4500);
  };

  // QR di hero mengarah ke halaman ini, jadi pengunjung bisa langsung scan dari HP
  useEffect(() => {
    QRCode.toDataURL(window.location.origin, { width: 256, margin: 0, errorCorrectionLevel: 'M' })
      .then(setHeroQr)
      .catch(() => {});
  }, []);

  // Bar CTA bawah (HP) muncul setelah pengunjung menggulir melewati hero
  useEffect(() => {
    const onScroll = () => setShowBar(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Kata "cocok untuk ..." berganti tiap beberapa detik (hanya tampil di layar lebar)
  useEffect(() => {
    const id = setInterval(() => setWordIdx((i) => (i + 1) % 6), 2400);
    return () => { clearInterval(id); clearTimeout(heroTimer.current); };
  }, []);
  const t = T[lang];

  // Lightbox galeri: Esc menutup, panah kiri/kanan berpindah foto, scroll halaman dikunci
  useEffect(() => {
    if (lightbox === null) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox((i) => (i + 1) % GALLERY.length);
      if (e.key === 'ArrowLeft') setLightbox((i) => (i - 1 + GALLERY.length) % GALLERY.length);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox]);

  // Ingat pilihan bahasa pengunjung
  useEffect(() => {
    try {
      const saved = localStorage.getItem('myreview-lang');
      if (saved === 'id' || saved === 'en') setLangState(saved);
      else if (navigator.language && !navigator.language.toLowerCase().startsWith('id')) setLangState('en');
    } catch {
      // abaikan jika localStorage tidak tersedia
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem('myreview-lang', l); } catch {}
  };

  const barVisible = showBar && !menuOpen && lightbox === null;

  return (
    <div className="relative isolate min-h-screen overflow-x-clip bg-slate-950 text-slate-300 font-sans scroll-smooth">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: 'radial-gradient(1000px 520px at 85% -8%, rgba(245,158,11,0.10), transparent 60%), radial-gradient(900px 620px at -10% 45%, rgba(66,133,244,0.09), transparent 60%), radial-gradient(800px 500px at 60% 110%, rgba(52,168,83,0.06), transparent 60%)' }}
      />
      <style>{`
        .mr-display { font-family: var(--font-playfair, "Playfair Display"), Georgia, "Times New Roman", serif; letter-spacing: -0.01em; }
        @keyframes mr-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes mr-pop { from { opacity: 0; transform: translateY(8px) scale(.94); } to { opacity: 1; transform: none; } }
        @keyframes mr-word { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        html { scroll-behavior: smooth; }
        button, a { -webkit-tap-highlight-color: transparent; }
        @keyframes mr-sway { 0%,100% { transform: rotateY(-12deg) rotateX(3deg); } 50% { transform: rotateY(12deg) rotateX(-4deg); } }
        @media (hover: none) { .mr-tilt { animation: mr-sway 8s ease-in-out infinite; } }
        .mr-float { animation: mr-float 6s ease-in-out infinite; }
        .mr-pop { animation: mr-pop .28s ease-out both; }
        @keyframes mr-wave { 0%,55%,100% { transform: scale(1) rotate(0); } 25% { transform: scale(1.3) rotate(-10deg); } }
        .mr-wave { animation: mr-wave 2.8s ease-in-out infinite; }
        @keyframes mr-burst { from { opacity: 1; transform: translate(-50%, -50%) scale(1); } to { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(.3); } }
        .mr-burst { animation: mr-burst .7s ease-out both; pointer-events: none; }
        @keyframes mr-timer { from { width: 100%; } to { width: 0; } }
        .mr-timer { animation: mr-timer 4.5s linear forwards; }
        .mr-word { animation: mr-word .35s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .mr-float, .mr-pop, .mr-word, .mr-wave, .mr-burst, .mr-timer { animation: none; }
          .mr-tilt { transform: none !important; animation: none !important; }
          html { scroll-behavior: auto; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/10 px-4 py-2.5 sm:px-6 sm:py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
            <span className="lg:hidden"><Logo height={44} tagline /></span><span className="hidden lg:block"><Logo height={56} tagline /></span>
          </a>
          <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
            {NAV_HREFS.map((href, i) => (
              <a key={href} href={href} className="hover:text-amber-400">{t.nav[i]}</a>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <LangSwitch lang={lang} setLang={setLang} />
            <LoginMenu t={t} />
            <a href="#demo" className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm text-sm">
              {t.tryDemo}
            </a>
          </div>
          <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu" aria-expanded={menuOpen} className="lg:hidden -mr-2 rounded-lg p-2.5">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {menuOpen && (
          <div className="lg:hidden max-w-6xl mx-auto pt-3 pb-2 space-y-1 max-h-[calc(100dvh-4.5rem)] overflow-y-auto">
            {NAV_HREFS.map((href, i) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block py-3 text-base font-medium text-slate-300">{t.nav[i]}</a>
            ))}
            <div className="pt-2 space-y-2">
              <LangSwitch lang={lang} setLang={setLang} full />
              <Link href="/login" onClick={() => setMenuOpen(false)} className="block w-full text-center border border-white/15 bg-slate-900/60 rounded-xl py-3 text-sm font-medium">{t.loginClient}</Link>
              <Link href="/admin/login" onClick={() => setMenuOpen(false)} className="block w-full text-center border border-white/15 bg-slate-900/60 rounded-xl py-3 text-sm font-medium">{t.loginAdmin}</Link>
              <a href="#demo" onClick={() => setMenuOpen(false)} className="block w-full text-center bg-amber-500 text-slate-950 rounded-xl py-3 text-sm font-medium">{t.tryDemo}</a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section
        ref={heroRef}
        onPointerMove={onHeroMove}
        onPointerLeave={onHeroLeave}
        className="relative overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(520px circle at var(--mx, 70%) var(--my, 30%), rgba(245,158,11,0.16), transparent 60%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-5 pt-8 pb-10 sm:px-6 sm:pt-16 sm:pb-12 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
              <Star size={14} className="fill-amber-500 text-amber-400" /> {t.heroBadge}
            </div>
            <h1 className="mr-display text-balance text-[2rem] sm:text-5xl font-bold text-white leading-tight mb-4">
              {t.heroTitle1}<span className="text-amber-400">{t.heroTitle2}</span>
            </h1>
            {/* baris kata berputar: disembunyikan di HP supaya hero tidak ramai */}
            <p className="mb-5 hidden min-h-[28px] text-lg font-semibold text-slate-300 sm:block">
              {t.heroFor}{' '}
              <span key={wordIdx} className="mr-word inline-block text-amber-400">{t.audience[wordIdx]}</span>
            </p>
            <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">{t.heroText}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a href="#harga" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(245,158,11,0.6)] transition-all text-center">{t.ctaOrder}</a>
              <a href="#demo" className="w-full sm:w-auto bg-slate-900/60 hover:bg-white/10 text-slate-200 font-semibold px-8 py-4 rounded-xl border border-white/10 shadow-sm transition-all text-center">{t.ctaSim}</a>
            </div>
          </div>

          <div>
            <HeroStand qr={heroQr} rating={heroRating} onRate={handleHeroRate} />
            <div className="mx-auto mt-7 min-h-[112px] max-w-[400px]">
              {heroRating > 0 ? (
                <div key={heroRating} className="mr-pop relative overflow-hidden rounded-2xl bg-slate-900 p-4 text-left shadow-xl ring-1 ring-white/10">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white p-2">
                      <GoogleG />
                    </span>
                    <div className="min-w-0">
                      <StarRow value={heroRating} size={16} />
                      <p className="mt-1 text-xs font-semibold leading-snug text-white">{t.demoThanks}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3.5 py-2 font-bold text-slate-950">
                      <Star size={12} className="fill-slate-950" /> {t.google}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-2 font-bold text-white">
                      <MessageCircle size={12} /> {t.wa}
                    </span>
                  </div>
                  <span aria-hidden="true" className="mr-timer absolute bottom-0 left-0 h-0.5 bg-amber-400" />
                </div>
              ) : (
                <p className="flex items-center justify-center gap-2.5 pt-4 text-center text-xs text-slate-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
                  </span>
                  {t.heroHint}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHT */}
      <section className="max-w-6xl mx-auto px-5 pb-8 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900/60 border border-white/10 rounded-2xl p-6 text-center shadow-sm">
          {t.stats.map(([big, small]) => (
            <div key={big}>
              <p className="text-xl sm:text-2xl font-black text-amber-400">{big}</p>
              <p className="text-xs text-slate-400 mt-1">{small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GALERI: PAPAN QR DI KAFE */}
      <section id="galeri" className="scroll-mt-20 max-w-6xl mx-auto px-5 py-10 sm:px-6 sm:py-12">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-5 sm:p-10 text-white ring-1 ring-white/10">
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />

          <div className="relative mb-8 flex flex-col gap-5 sm:mb-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 className="mr-display text-balance mb-2 text-2xl font-bold sm:text-3xl text-white">{t.galleryTitle}</h2>
              <p className="text-sm leading-relaxed text-slate-300">{t.gallerySub}</p>
            </div>
            <a href="#harga" className="inline-flex w-full items-center justify-center rounded-xl bg-amber-500 px-6 py-3 sm:w-fit text-sm font-bold text-slate-950 transition-colors hover:bg-amber-400">
              {t.galleryCta}
            </a>
          </div>

          <div className="relative flex snap-x snap-mandatory items-center gap-3 overflow-x-auto py-4 sm:gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {GALLERY.map((g, i) => (
              <button
                key={g.src}
                type="button"
                onClick={() => setLightbox(i)}
                aria-label={`${t.galleryCaps[i]}, ${t.galleryZoom}`}
                className="group relative block w-[58%] shrink-0 snap-center overflow-hidden rounded-2xl sm:w-[34%] lg:w-[calc((100%-4rem)/5)] shadow-2xl shadow-black/40 ring-1 ring-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <Image
                  src={g.src}
                  alt={`${t.galleryCaps[i]} - MyReview`}
                  width={g.w}
                  height={g.h}
                  sizes="(min-width: 1024px) 18vw, 58vw"
                  className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent px-3.5 pb-3 pt-10 text-left text-xs font-medium text-white">
                  {t.galleryCaps[i]}
                  <ZoomIn size={14} className="shrink-0 text-amber-300" />
                </span>
              </button>
            ))}
          </div>

          {GALLERY_IS_ILLUSTRATION && <p className="relative mt-6 text-[11px] text-slate-400">{t.galleryNote}</p>}
        </div>
      </section>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={t.galleryCaps[lightbox]}
          onClick={() => setLightbox(null)}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) setLightbox((i) => (i + (dx < 0 ? 1 : -1) + GALLERY.length) % GALLERY.length);
          }}
        >
          <button
            type="button"
            aria-label={t.galleryClose}
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20"
          >
            <X size={22} />
          </button>
          <button
            type="button"
            aria-label={t.galleryPrev}
            onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i - 1 + GALLERY.length) % GALLERY.length); }}
            className="absolute bottom-6 left-6 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
          >
            <ChevronLeft size={24} />
          </button>
          <figure className="flex max-h-full flex-col items-center pb-12 sm:pb-0" onClick={(e) => e.stopPropagation()}>
            <Image
              src={GALLERY[lightbox].src}
              alt={`${t.galleryCaps[lightbox]} - MyReview`}
              width={GALLERY[lightbox].w}
              height={GALLERY[lightbox].h}
              sizes="90vw"
              style={{ width: 'auto', height: 'auto' }}
              className="max-h-[68dvh] max-w-full rounded-2xl shadow-2xl sm:max-h-[80vh]"
            />
            <figcaption className="mt-3 text-center text-sm text-slate-300">
              {t.galleryCaps[lightbox]} ({lightbox + 1}/{GALLERY.length})
            </figcaption>
          </figure>
          <button
            type="button"
            aria-label={t.galleryNext}
            onClick={(e) => { e.stopPropagation(); setLightbox((i) => (i + 1) % GALLERY.length); }}
            className="absolute bottom-6 right-6 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* PILIHAN DESAIN PAPAN (dipindah ke atas: produk dulu, penjelasan kemudian) */}
      <StandeeShowcase lang={lang} waLink={waLink} />

      {/* MASALAH & SOLUSI */}
      <section className="max-w-6xl mx-auto px-5 py-10 sm:px-6 sm:py-12">
        <h2 className="mr-display text-balance text-2xl sm:text-3xl font-bold text-center mb-10 text-white">{t.problemTitle}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 p-7 rounded-2xl border border-white/10">
            <p className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3">{t.withoutTitle}</p>
            <ul className="space-y-3 text-sm text-slate-400">
              {t.without.map((x) => (
                <li key={x} className="flex gap-2.5"><X size={16} className="mt-0.5 shrink-0 text-red-400" /><span>{x}</span></li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-900 p-7 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">{t.withTitle}</p>
            <ul className="space-y-3 text-sm text-slate-300">
              {t.withList.map((x) => (
                <li key={x} className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-amber-400" /><span>{x}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* TESTIMONI (otomatis tersembunyi sampai TESTIMONIALS diisi testimoni asli) */}
      {TESTIMONIALS.length > 0 && (
        <section id="testimoni" className="scroll-mt-20 max-w-6xl mx-auto px-5 py-10 sm:px-6 sm:py-12">
          <h2 className="mr-display text-balance text-2xl sm:text-3xl font-bold text-center mb-10 text-white">{t.proofTitle}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((x) => (
              <figure key={x.name} className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
                <StarRow value={5} size={16} className="mb-3" />
                <blockquote className="text-sm leading-relaxed text-slate-300">“{x.quote}”</blockquote>
                <figcaption className="mt-4 text-xs text-slate-400">
                  <span className="font-semibold text-white">{x.name}</span>{x.role ? `, ${x.role}` : ''}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* CARA KERJA (pita latar untuk memberi ritme) */}
      <div className="border-y border-white/5 bg-white/[0.025]">
        <section id="cara-kerja" className="scroll-mt-20 max-w-6xl mx-auto px-5 py-12 sm:px-6 sm:py-16">
          <h2 className="mr-display text-balance text-2xl sm:text-3xl font-bold text-center mb-2 text-white">{t.howTitle}</h2>
          <p className="text-center text-slate-400 text-sm mb-10">{t.howSub}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.steps.map((s, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <div key={s.title} className="bg-slate-900/60 p-6 rounded-2xl border border-white/10 shadow-sm relative">
                  <span className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-amber-500 text-slate-950 text-sm font-bold flex items-center justify-center shadow">{i + 1}</span>
                  <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4"><Icon size={22} /></div>
                  <h3 className="font-bold mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.text}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* DEMO: semua rating mendapat dua pilihan yang sama (tanpa review gating) */}
      <section id="demo" className="scroll-mt-20 max-w-4xl mx-auto px-5 py-10 sm:px-6 sm:py-12 font-sans">
        <div className="bg-slate-900/60 rounded-3xl p-5 pt-12 sm:p-10 shadow-xl border border-white/10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
            {t.demoBadge}
          </div>
          <h2 className="mr-display text-balance text-2xl font-bold mb-2 text-white">{t.demoTitle}</h2>
          <p className="text-slate-400 text-sm mb-6">{t.demoSub}</p>

          <div className="bg-slate-950 border border-white/10 rounded-2xl p-5 sm:p-6 max-w-md mx-auto text-left sm:text-center">
            <p className="font-semibold text-slate-200 mb-2 text-center">{t.demoVenue}</p>

            {demoRating === 0 ? (
              <>
                <p className="text-xs text-slate-400 mb-4 text-center">{t.demoAsk}</p>
                <div className="flex justify-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      aria-label={`${star}/5`}
                      onClick={() => setDemoRating(star)}
                      className="p-1 text-slate-600 hover:text-amber-400 hover:scale-125 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
                    >
                      <Star size={32} className="fill-current" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="mr-pop space-y-4 text-center">
                <StarRow value={demoRating} size={24} className="justify-center" />
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <p className="text-xs font-semibold text-amber-200">{t.demoThanks}</p>
                </div>

                {/* dua pilihan yang sama untuk SEMUA rating */}
                <div className="grid gap-2.5">
                  <a
                    href={DEMO_GOOGLE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Star size={14} className="fill-slate-950" />
                    <span>{t.google}</span>
                  </a>
                  <a
                    href={waLink(t.demoWaMsg(demoRating))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={14} />
                    <span>{t.wa}</span>
                  </a>
                </div>

                <p className="text-[11px] text-slate-500">{t.demoSame}</p>
                <button
                  type="button"
                  onClick={() => setDemoRating(0)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline font-medium block mx-auto"
                >
                  {t.demoRetry}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FITUR + COCOK UNTUK (digabung) */}
      <div className="border-y border-white/5 bg-white/[0.025]">
        <section id="fitur" className="scroll-mt-20 max-w-6xl mx-auto px-5 py-12 sm:px-6 sm:py-16">
          <h2 className="mr-display text-balance text-2xl sm:text-3xl font-bold text-center mb-10 text-white">{t.featTitle}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div key={f.title} className="bg-slate-900/60 p-6 rounded-2xl border border-white/10 shadow-sm">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mb-4"><Icon size={24} /></div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.text}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm font-semibold text-slate-400 mb-4">{t.audTitle}</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {t.audience.map((label, i) => {
                const Icon = AUDIENCE_ICONS[i];
                return (
                  <span key={label} className="inline-flex items-center gap-2 bg-slate-900/60 border border-white/10 rounded-full px-4 py-2 text-xs sm:text-sm font-medium">
                    <Icon size={15} className="text-amber-400" />
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* PREVIEW DASHBOARD */}
      <section className="max-w-6xl mx-auto px-5 py-10 sm:px-6 sm:py-12">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white ring-1 ring-white/10 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">{t.dashTag}</p>
            <h2 className="mr-display text-balance text-2xl sm:text-3xl font-bold mb-3 text-white">{t.dashTitle}</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-5">{t.dashText}</p>
            <Link href="/login" className="inline-block bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm">{t.dashBtn}</Link>
          </div>
          <div>
            <div className="grid grid-cols-3 gap-3">
              {t.dashStats.map(([l, v]) => (
                <div key={l} className="rounded-xl bg-slate-800 p-3 text-center sm:p-4">
                  <p className="text-xl font-black text-amber-400">{v}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{l}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 text-right">{t.dashNote}</p>
          </div>
        </div>
      </section>

      {/* HARGA */}
      <section id="harga" className="scroll-mt-20 max-w-4xl mx-auto px-5 py-10 sm:px-6 sm:py-12">
        <h2 className="mr-display text-balance text-2xl sm:text-3xl font-bold text-center mb-2 text-white">{t.priceTitle}</h2>
        <p className="text-center text-slate-400 text-sm mb-10">{t.priceSub}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900/60 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xl mb-1">{t.starter.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{t.starter.desc}</p>
              <div className="flex flex-wrap items-baseline gap-x-2 text-3xl font-black">Rp 150.000 <span className="text-xs font-normal text-slate-400">{t.once}</span></div>
              <p className="mt-1 mb-6 text-xs font-medium text-slate-400">{t.starter.per}</p>
              <ul className="space-y-3 text-sm text-slate-400 mb-8">
                {t.starter.items.map((x) => (
                  <li key={x} className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-amber-400" /><span>{x}</span></li>
                ))}
              </ul>
            </div>
            <a href={waLink(t.starter.wa)} target="_blank" rel="noopener noreferrer" className="w-full bg-white/10 hover:bg-white/15 text-slate-200 font-semibold py-3 rounded-xl transition-all text-center block text-sm">{t.starter.cta}</a>
          </div>

          <div className="bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-[0_0_70px_-25px_rgba(245,158,11,0.55)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 font-bold text-[10px] px-3 py-1 rounded-full uppercase">{t.pro.badge}</div>
            <div>
              <h3 className="font-bold text-xl mb-1 pr-28 text-amber-400 sm:pr-0">{t.pro.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{t.pro.desc}</p>
              <div className="flex flex-wrap items-baseline gap-x-2 text-3xl font-black">Rp 350.000 <span className="text-xs font-normal text-slate-400">{t.once}</span></div>
              <p className="mt-1 text-xs font-medium text-slate-300">{t.pro.per}</p>
              <p className="mb-6 mt-1.5 inline-block rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">{t.pro.save}</p>
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                {t.pro.items.map((x) => (
                  <li key={x} className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-amber-400" /><span>{x}</span></li>
                ))}
              </ul>
            </div>
            <a href={waLink(t.pro.wa)} target="_blank" rel="noopener noreferrer" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 rounded-xl transition-all text-center block text-sm">{t.pro.cta}</a>
          </div>
        </div>

        {/* Langkah setelah memesan */}
        <div className="mt-12">
          <p className="text-center text-sm font-semibold text-slate-300 mb-5">{t.orderTitle}</p>
          <ol className="grid gap-4 sm:grid-cols-3">
            {t.orderSteps.map((s, i) => (
              <li key={s.title} className="relative rounded-2xl border border-white/10 bg-slate-900/60 p-5">
                <span className="mb-3 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-400 ring-1 ring-amber-500/30">{i + 1}</span>
                <p className="mb-1 text-sm font-bold text-white">{s.title}</p>
                <p className="text-xs leading-relaxed text-slate-400">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 max-w-3xl mx-auto px-5 py-10 sm:px-6 sm:py-12">
        <h2 className="mr-display text-balance text-2xl sm:text-3xl font-bold text-center mb-8 text-white">{t.faqTitle}</h2>
        <div className="space-y-3">
          {t.faqs.map((f) => (
            <details key={f.q} className="group bg-slate-900/60 border border-white/10 rounded-xl px-5 py-4 shadow-sm">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-semibold text-sm">
                {f.q}
                <Plus size={18} className="text-amber-400 shrink-0 transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-sm text-slate-400 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA AKHIR */}
      <section className="max-w-4xl mx-auto px-5 py-10 sm:px-6 sm:py-12">
        <div className="bg-amber-500 rounded-3xl p-6 sm:p-12 text-center">
          <h2 className="mr-display text-balance text-2xl sm:text-3xl font-black text-slate-950 mb-3">{t.finalTitle}</h2>
          <p className="text-slate-900/80 text-sm mb-6">{t.finalText}</p>
          <a href={waLink(t.finalWa)} target="_blank" rel="noopener noreferrer" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3.5 rounded-xl text-sm">{t.finalBtn}</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-slate-950 pt-10 pb-28 px-5 sm:px-6 md:pb-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-lg font-black text-amber-400">MyReview</p>
          <div className="flex flex-wrap justify-center gap-5">
            <a href="#cara-kerja" className="hover:text-amber-400">{t.nav[0]}</a>
            <a href="#harga" className="hover:text-amber-400">{t.nav[3]}</a>
            <Link href="/login" className="hover:text-amber-400">{t.loginClient}</Link>
            <Link href="/admin/login" className="hover:text-amber-400">{t.loginAdmin}</Link>
          </div>
          <p>{t.rights}</p>
        </div>
      </footer>

      {/* BAR AKSI BAWAH (HP) */}
      <div
        aria-hidden={!barVisible}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-slate-950/85 px-4 pt-3 backdrop-blur-xl transition-transform duration-300 md:hidden ${
          barVisible ? 'translate-y-0' : 'pointer-events-none translate-y-full'
        }`}
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="mx-auto flex max-w-md gap-2.5">
          <a href="#harga" tabIndex={barVisible ? 0 : -1} className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-semibold text-slate-200">
            {t.nav[3]}
          </a>
          <a
            href={waLink(t.finalWa)}
            tabIndex={barVisible ? 0 : -1}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex flex-[1.6] items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950"
          >
            <MessageCircle size={16} /> {t.finalBtn}
          </a>
        </div>
      </div>
    </div>
  );
}