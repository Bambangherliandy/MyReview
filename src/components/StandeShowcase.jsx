'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { MessageCircle } from 'lucide-react';
import { StandeeBoard, THEMES, THEME_KEYS } from '@/components/Standeeboard';

// ---------------------------------------------------------------
// Teks bagian ini (Indonesia / Inggris), supaya file ini berdiri sendiri
// ---------------------------------------------------------------
const TEXT = {
  id: {
    tag: 'Desain Papan QR',
    title: 'Pilih Desain Papan yang Cocok dengan Suasana Usahamu',
    sub: 'Ketik nama usahamu dan lihat hasilnya langsung. Scan QR pada contoh ini untuk mencoba pengalaman pelanggan.',
    nameLabel: 'Nama usahamu',
    namePh: 'Contoh: Kopi Senja',
    sample: 'Kopi Senja',
    themeLabel: 'Pilih desain',
    chosen: 'Desain terpilih',
    note: 'Ukuran papan bisa disesuaikan, misalnya 10 × 10 cm atau 10 × 15 cm. Nama usaha dicetak sesuai pesananmu.',
    cta: 'Pesan dengan Desain Ini',
    wa: (design, name) => `Halo Admin MyReview, saya tertarik dengan desain "${design}" untuk usaha "${name}"`,
    count: (n) => `${n} pilihan desain`,
  },
  en: {
    tag: 'QR Stand Designs',
    title: 'Pick a Stand Design That Fits Your Venue',
    sub: 'Type your business name and see the result instantly. Scan the QR on this sample to try the customer experience.',
    nameLabel: 'Your business name',
    namePh: 'e.g. Sunset Coffee',
    sample: 'Sunset Coffee',
    themeLabel: 'Choose a design',
    chosen: 'Selected design',
    note: 'Stand size can be adjusted, for example 10 × 10 cm or 10 × 15 cm. Your business name is printed as ordered.',
    cta: 'Order This Design',
    wa: (design, name) => `Hello MyReview Admin, I am interested in the "${design}" design for "${name}"`,
    count: (n) => `${n} designs`,
  },
};

export default function StandeeShowcase({ lang = 'id', waLink }) {
  const s = TEXT[lang] || TEXT.id;
  const [theme, setTheme] = useState('midnight');
  const [name, setName] = useState('');
  const [qr, setQr] = useState('');
  const [big, setBig] = useState(300);

  // QR contoh: mengarah ke bagian demo di halaman ini
  useEffect(() => {
    const target = `${window.location.origin}/#demo`;
    QRCode.toDataURL(target, { width: 512, margin: 0, errorCorrectionLevel: 'M' })
      .then(setQr)
      .catch(() => setQr(''));
  }, []);

  // Papan besar menyesuaikan lebar layar supaya tidak keluar dari kotak
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setBig(w >= 640 ? 360 : Math.max(200, Math.min(340, w - 128)));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const shownName = name.trim() || s.sample;
  const themeTitle = THEMES[theme].title;

  return (
    <section id="desain" className="scroll-mt-20 max-w-6xl mx-auto px-5 py-10 sm:px-6 sm:py-12">
      <div className="text-center mb-10">
        <span className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 uppercase tracking-wider">
          {s.tag}
        </span>
        <h2 className="mr-display text-balance text-2xl sm:text-3xl font-bold mb-2 text-white">{s.title}</h2>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto">{s.sub}</p>
      </div>

      <div className="relative overflow-hidden bg-slate-900/60 rounded-3xl border border-white/10 shadow-xl p-5 sm:p-10 grid lg:grid-cols-[auto_1fr] gap-8 lg:gap-12 items-center">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

        {/* Pratinjau besar */}
        <div className="relative flex justify-center">
          <div className="rounded-3xl bg-gradient-to-br from-slate-800 to-slate-950 ring-1 ring-white/10 p-4 sm:p-9">
            <StandeeBoard
              width={big}
              height={big}
              theme={theme}
              name={shownName}
              qr={qr}
              alt="QR Code"
              lang={lang}
            />
          </div>
        </div>

        {/* Pengaturan */}
        <div className="relative space-y-6 min-w-0">
          <div>
            <label htmlFor="standee-name" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {s.nameLabel}
            </label>
            <input
              id="standee-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder={s.namePh}
              className="w-full rounded-xl border border-white/15 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{s.themeLabel}</p>
              <p className="text-xs text-slate-500">{s.count(THEME_KEYS.length)}</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {THEME_KEYS.map((k) => {
                const active = theme === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setTheme(k)}
                    aria-pressed={active}
                    aria-label={THEMES[k].title}
                    title={THEMES[k].title}
                    className={`rounded-2xl p-1 border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                      active
                        ? 'border-amber-500 bg-amber-500/10 shadow-lg scale-[1.04]'
                        : 'border-transparent hover:border-white/20 hover:bg-white/5'
                    }`}
                  >
                    <StandeeBoard
                      width={72}
                      height={72}
                      theme={k}
                      name={shownName}
                      qr={qr}
                      alt=""
                      lang={lang}
                      shadow={false}
                    />
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-slate-300">
              {s.chosen}: <span className="font-bold text-white">{themeTitle}</span>
            </p>
          </div>

          <div className="space-y-3">
            <a
              href={waLink ? waLink(s.wa(themeTitle, shownName)) : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-7 py-3.5 rounded-xl text-sm shadow-[0_10px_40px_-10px_rgba(245,158,11,0.6)] transition-all"
            >
              <MessageCircle size={18} />
              {s.cta}
            </a>
            <p className="text-xs text-slate-400 leading-relaxed">{s.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}