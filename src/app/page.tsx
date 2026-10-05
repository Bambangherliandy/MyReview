'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Star, Coffee, Smartphone, PenLine, BarChart3, Zap, MessageCircle, TrendingUp,
  BadgeCheck, QrCode, SlidersHorizontal, UtensilsCrossed, Scissors, BedDouble,
  Store, Dumbbell, Check, X, Menu, ChevronDown, Plus, Globe,
} from 'lucide-react';
import ClientShowcaseAnimation from '@/components/animation';
import Logo from "@/components/logo";

const WA_NUMBER = '6285129126104';
const waLink = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;

const NAV_HREFS = ['#cara-kerja', '#fitur', '#harga', '#faq'];
const STEP_ICONS = [Smartphone, Star, PenLine, BarChart3];
const FEATURE_ICONS = [Zap, MessageCircle, TrendingUp, BadgeCheck, QrCode, SlidersHorizontal];
const AUDIENCE_ICONS = [Coffee, UtensilsCrossed, Scissors, BedDouble, Store, Dumbbell];

// ---------------------------------------------------------------
// TERJEMAHAN / TRANSLATIONS
// ---------------------------------------------------------------
const My = () => <span style={{ color: '#F59E0B' }}>My</span>;
const T = {
  id: {
    nav: ['Cara Kerja', 'Fitur', 'Harga', 'FAQ'],
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
    howTitle: <>Cara Kerja <My />Review</>, howSub: 'Empat langkah sederhana, dari meja sampai dashboard',
    steps: [
      { title: 'Pelanggan scan QR', text: 'QR ada di meja atau kasir. Tanpa install aplikasi, langsung terbuka di browser HP.' },
      { title: 'Pilih bintang', text: 'Pelanggan memberi rating 1–5 dalam satu ketukan.' },
      { title: 'Pilih cara berbagi', text: 'Tulis ulasan di Google atau kirim masukan langsung ke WhatsApp pemilik.' },
      { title: 'Pantau di dashboard', text: 'Jumlah scan, rating rata-rata, dan pilihan pelanggan tercatat otomatis.' },
    ],
    demoBadge: 'Demo Interaktif', demoTitle: 'Cobalah Simulasi Scan Pelanggan',
    demoSub: 'Klik jumlah bintang untuk melihat apa yang akan dilihat pelangganmu:',
    demoVenue: 'Kafe Kenangan Kita', demoAsk: 'Bagaimana pengalaman kopi Anda hari ini?',
    demoThanks: 'Terima kasih! Pilih cara Anda ingin berbagi pengalaman:',
    demoWa: 'Kirim masukan ke pemilik via WhatsApp', demoSame: 'Semua rating mendapat dua pilihan yang sama.', demoRetry: 'Coba Lagi',
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
    audTitle: 'Cocok untuk Berbagai Jenis Usaha',
    audience: ['Kafe & Kedai Kopi', 'Restoran', 'Salon & Barbershop', 'Hotel & Homestay', 'Toko & Butik', 'Gym & Studio'],
    priceTitle: <>Paket Penawaran <My />Review</>, priceSub: 'Pilih paket yang sesuai dengan jumlah meja usaha kamu', once: '/ sekali bayar',
    starter: { name: 'Starter Pack', desc: 'Cocok untuk Kafe Kecil / Kedai Kopi', items: ['5 Papan Akrilik Meja High Quality', 'QR Code & Sistem MyReview Aktif', 'Bebas Atur Link Ulasan & WA', 'Tanpa Biaya Langganan Bulanan'], cta: 'Pesan Paket Starter', wa: 'Halo Admin MyReview, saya tertarik pesan Paket Starter' },
    pro: { name: 'Pro Business', desc: 'Cocok untuk Restoran & Kafe Besar', badge: 'Paling Populer', items: ['15 Papan Akrilik Meja Custom Logo', 'QR Code & Sistem MyReview Aktif', 'Laporan Statistik Scan Bulanan', 'Support & Garansi Papan Akrilik'], cta: 'Pesan Paket Pro', wa: 'Halo Admin MyReview, saya tertarik pesan Paket Pro Business' },
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
    nav: ['How It Works', 'Features', 'Pricing', 'FAQ'],
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
    audTitle: 'Great for Many Types of Business',
    audience: ['Cafes & Coffee Shops', 'Restaurants', 'Salons & Barbershops', 'Hotels & Homestays', 'Shops & Boutiques', 'Gyms & Studios'],
    priceTitle: <><My />Review Packages</>, priceSub: 'Choose the package that fits the number of tables in your business', once: '/ one-time',
    starter: { name: 'Starter Pack', desc: 'Great for small cafes / coffee shops', items: ['5 High Quality Acrylic Table Stands', 'QR Code & MyReview System Activated', 'Set Your Own Review Link & WhatsApp', 'No Monthly Subscription Fee'], cta: 'Order Starter Pack', wa: 'Hello MyReview Admin, I am interested in the Starter Pack' },
    pro: { name: 'Pro Business', desc: 'Great for restaurants & larger cafes', badge: 'Most Popular', items: ['15 Acrylic Table Stands with Custom Logo', 'QR Code & MyReview System Activated', 'Monthly Scan Statistics Report', 'Support & Acrylic Stand Warranty'], cta: 'Order Pro Package', wa: 'Hello MyReview Admin, I am interested in the Pro Business package' },
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
        <Star key={i} size={size} className={i <= value ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'} />
      ))}
    </div>
  );
}

function LangSwitch({ lang, setLang, full = false }) {
  return (
    <div className={`inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white p-1 ${full ? 'w-full justify-center' : ''}`}>
      <Globe size={14} className="ml-1.5 text-slate-400" />
      {['id', 'en'].map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase transition-colors ${
            lang === l ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-slate-800'
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
        className="inline-flex items-center justify-center gap-1.5 border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-medium px-5 py-2.5 rounded-xl text-sm transition-all"
      >
        {t.login} <ChevronDown size={16} />
      </button>
      {open && (
        <>
          <button type="button" aria-label={t.closeMenu} onClick={() => setOpen(false)} className="fixed inset-0 z-40 cursor-default" />
          <div className="absolute right-0 z-50 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            <Link href="/login" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-left hover:bg-amber-50">
              <span className="block text-sm font-semibold text-slate-900">{t.loginClient}</span>
              <span className="block text-xs text-slate-500">{t.loginClientSub}</span>
            </Link>
            <Link href="/admin/login" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-left hover:bg-amber-50">
              <span className="block text-sm font-semibold text-slate-900">{t.loginAdmin}</span>
              <span className="block text-xs text-slate-500">{t.loginAdminSub}</span>
            </Link>
          </div>
        </>
      )}
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
  const t = T[lang];

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans scroll-smooth">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
          <Logo height={56} tagline />  
          </a>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {NAV_HREFS.map((href, i) => (
              <a key={href} href={href} className="hover:text-amber-600">{t.nav[i]}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <LangSwitch lang={lang} setLang={setLang} />
            <LoginMenu t={t} />
            <a href="#demo" className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm text-sm">
              {t.tryDemo}
            </a>
          </div>
          <button type="button" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu" className="md:hidden px-2">
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden max-w-6xl mx-auto pt-4 pb-2 space-y-1">
            {NAV_HREFS.map((href, i) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium text-slate-700">{t.nav[i]}</a>
            ))}
            <div className="pt-2 space-y-2">
              <LangSwitch lang={lang} setLang={setLang} full />
              <Link href="/login" className="block w-full text-center border border-slate-300 bg-white rounded-xl py-2.5 text-sm font-medium">{t.loginClient}</Link>
              <Link href="/admin/login" className="block w-full text-center border border-slate-300 bg-white rounded-xl py-2.5 text-sm font-medium">{t.loginAdmin}</Link>
              <a href="#demo" onClick={() => setMenuOpen(false)} className="block w-full text-center bg-amber-500 text-white rounded-xl py-2.5 text-sm font-medium">{t.tryDemo}</a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 bg-amber-100 border border-amber-200 text-amber-900 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <Star size={14} className="fill-amber-500 text-amber-500" /> {t.heroBadge}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 leading-tight mb-5">
            {t.heroTitle1}<span className="text-amber-500">{t.heroTitle2}</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg mb-8 leading-relaxed">{t.heroText}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <a href="#harga" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg transition-all text-center">{t.ctaOrder}</a>
            <a href="#demo" className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-800 font-semibold px-8 py-4 rounded-xl border border-slate-200 shadow-sm transition-all text-center">{t.ctaSim}</a>
          </div>
        </div>

        <div className="justify-center">
          <ClientShowcaseAnimation/>
        </div>
      </section>

      {/* HIGHLIGHT */}
      <section className="max-w-6xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
          {t.stats.map(([big, small]) => (
            <div key={big}>
              <p className="text-xl sm:text-2xl font-black text-amber-500">{big}</p>
              <p className="text-xs text-slate-500 mt-1">{small}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MASALAH & SOLUSI */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">{t.problemTitle}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-7 rounded-2xl border border-slate-200">
            <p className="text-xs font-bold uppercase tracking-wider text-red-500 mb-3">{t.withoutTitle}</p>
            <ul className="space-y-3 text-sm text-slate-600">
              {t.without.map((x) => (
                <li key={x} className="flex gap-2.5"><X size={16} className="mt-0.5 shrink-0 text-red-500" /><span>{x}</span></li>
              ))}
            </ul>
          </div>
          <div className="bg-slate-900 text-white p-7 rounded-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">{t.withTitle}</p>
            <ul className="space-y-3 text-sm text-slate-300">
              {t.withList.map((x) => (
                <li key={x} className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-amber-400" /><span>{x}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CARA KERJA */}
      <section id="cara-kerja" className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">{t.howTitle}</h2>
        <p className="text-center text-slate-500 text-sm mb-10">{t.howSub}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.steps.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div key={s.title} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
                <span className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-amber-500 text-white text-sm font-bold flex items-center justify-center shadow">{i + 1}</span>
                <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4"><Icon size={22} /></div>
                <h3 className="font-bold mb-1">{s.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* DEMO */}
      <section id="demo" className="max-w-4xl mx-auto px-6 py-12 font-sans">
  <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200 text-center relative overflow-hidden">
    <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
      {t.demoBadge || 'DEMO INTERAKTIF'}
    </div>
    <h2 className="text-2xl font-bold mb-2 text-slate-900">{t.demoTitle || 'Coba Simulasi MyReview'}</h2>
    <p className="text-slate-500 text-sm mb-6">{t.demoSub || 'Lihat bagaimana sistem memfilter ulasan secara otomatis'}</p>

    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-md mx-auto text-left sm:text-center">
      <p className="font-semibold text-slate-800 mb-2 text-center">{t.demoVenue || 'Kopi Contoh - Merdeka'}</p>

      {demoRating === 0 ? (
        <>
          <p className="text-xs text-slate-500 mb-4 text-center">{t.demoAsk || 'Bagaimana pengalaman Anda hari ini?'}</p>
          <div className="flex justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star}/5`}
                onClick={() => setDemoRating(star)}
                className="text-slate-300 hover:text-amber-400 hover:scale-125 transition-transform focus:outline-none"
              >
                <Star size={32} className="fill-current" />
              </button>
            ))}
          </div>
        </>
      ) : demoRating >= 4 ? (
        /* ALUR BINTANG 4 & 5 (GOOGLE MAPS) */
        <div className="space-y-4 text-center animate-fade-in">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={24} className={s <= demoRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
            ))}
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs font-semibold text-amber-900">
              🎉 Terima kasih! Rating positif ({demoRating}★) langsung diarahkan ke Google Maps.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              // Buka URL Google Maps Review di tab baru
              const demoGoogleUrl = 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDe1EmsRUsoyG83frY4';
              window.open(demoGoogleUrl, '_blank');
            }}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>Lanjut Tulis Ulasan di Google Maps</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoRating(0)}
            className="text-xs text-slate-400 hover:text-slate-600 underline font-medium block mx-auto"
          >
            {t.demoRetry || 'Coba Lagi Simulasi'}
          </button>
        </div>
      ) : (
        /* ALUR BINTANG 1, 2, & 3 (WHATSAPP PRIVAT) */
        <div className="space-y-4 text-center animate-fade-in">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={24} className={s <= demoRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
            ))}
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-xs font-semibold text-blue-900">
              🛡️ Masukan privat disalurkan langsung ke WhatsApp pemilik usaha agar ulasan publik tetap aman.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              // Buka WhatsApp Demo dengan pesan khusus
              const waMessage = encodeURIComponent(
                `Halo Admin (Simulasi Demo MyReview),\nSaya ingin memberikan masukan untuk Kopi Contoh (Rating: ${demoRating}★).`
              );
              window.open(`https://wa.me/6281234567890?text=${waMessage}`, '_blank');
            }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <span>Kirim Masukan via WhatsApp</span>
          </button>
          <button
            type="button"
            onClick={() => setDemoRating(0)}
            className="text-xs text-slate-400 hover:text-slate-600 underline font-medium block mx-auto"
          >
            {t.demoRetry || 'Coba Lagi Simulasi'}
          </button>
        </div>
      )}
    </div>
  </div>
</section>

      {/* FITUR */}
      <section id="fitur" className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">{t.featTitle}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {t.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={f.title} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4"><Icon size={24} /></div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PREVIEW DASHBOARD */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">{t.dashTag}</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t.dashTitle}</h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-5">{t.dashText}</p>
            <Link href="/login" className="inline-block bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl text-sm">{t.dashBtn}</Link>
          </div>
          <div>
            <div className="grid grid-cols-3 gap-3">
              {t.dashStats.map(([l, v]) => (
                <div key={l} className="rounded-xl bg-slate-800 p-4 text-center">
                  <p className="text-xl font-black text-amber-400">{v}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{l}</p>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-right">{t.dashNote}</p>
          </div>
        </div>
      </section>

      {/* COCOK UNTUK */}
      <section className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-8">{t.audTitle}</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {t.audience.map((label, i) => {
            const Icon = AUDIENCE_ICONS[i];
            return (
              <span key={label} className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-5 py-2.5 text-sm font-medium shadow-sm">
                <Icon size={16} className="text-amber-600" />
                {label}
              </span>
            );
          })}
        </div>
      </section>

      {/* HARGA */}
      <section id="harga" className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">{t.priceTitle}</h2>
        <p className="text-center text-slate-500 text-sm mb-10">{t.priceSub}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xl mb-1">{t.starter.name}</h3>
              <p className="text-xs text-slate-500 mb-4">{t.starter.desc}</p>
              <div className="text-3xl font-black mb-6">Rp 150.000 <span className="text-xs font-normal text-slate-400">{t.once}</span></div>
              <ul className="space-y-3 text-sm text-slate-600 mb-8">
                {t.starter.items.map((x) => (
                  <li key={x} className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-amber-500" /><span>{x}</span></li>
                ))}
              </ul>
            </div>
            <a href={waLink(t.starter.wa)} target="_blank" rel="noopener noreferrer" className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 rounded-xl transition-all text-center block text-sm">{t.starter.cta}</a>
          </div>

          <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 font-bold text-[10px] px-3 py-1 rounded-full uppercase">{t.pro.badge}</div>
            <div>
              <h3 className="font-bold text-xl mb-1 text-amber-400">{t.pro.name}</h3>
              <p className="text-xs text-slate-400 mb-4">{t.pro.desc}</p>
              <div className="text-3xl font-black mb-6">Rp 350.000 <span className="text-xs font-normal text-slate-400">{t.once}</span></div>
              <ul className="space-y-3 text-sm text-slate-300 mb-8">
                {t.pro.items.map((x) => (
                  <li key={x} className="flex gap-2.5"><Check size={16} className="mt-0.5 shrink-0 text-amber-400" /><span>{x}</span></li>
                ))}
              </ul>
            </div>
            <a href={waLink(t.pro.wa)} target="_blank" rel="noopener noreferrer" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3 rounded-xl transition-all text-center block text-sm">{t.pro.cta}</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">{t.faqTitle}</h2>
        <div className="space-y-3">
          {t.faqs.map((f) => (
            <details key={f.q} className="group bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 font-semibold text-sm">
                {f.q}
                <Plus size={18} className="text-amber-500 shrink-0 transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA AKHIR */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-amber-500 rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mb-3">{t.finalTitle}</h2>
          <p className="text-slate-900/80 text-sm mb-6">{t.finalText}</p>
          <a href={waLink(t.finalWa)} target="_blank" rel="noopener noreferrer" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-3.5 rounded-xl text-sm">{t.finalBtn}</a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p className="text-lg font-black text-amber-500">MyReview</p>
          <div className="flex flex-wrap justify-center gap-5">
            <a href="#cara-kerja" className="hover:text-amber-600">{t.nav[0]}</a>
            <a href="#harga" className="hover:text-amber-600">{t.nav[2]}</a>
            <Link href="/login" className="hover:text-amber-600">{t.loginClient}</Link>
            <Link href="/admin/login" className="hover:text-amber-600">{t.loginAdmin}</Link>
          </div>
          <p>{t.rights}</p>
        </div>
      </footer>
    </div>
  );
}