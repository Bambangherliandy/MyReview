'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Data foto-foto klien/testimoni kamu
const clientShowcase = [
  {
    id: 1,
    name: 'Kopi Kenangan - Merdeka',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=600', // Ganti dengan URL/path foto fisik/standee asli
    category: 'Coffee Shop',
  },
  {
    id: 2,
    name: 'Restoran Sederhana',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600',
    category: 'Culinary & Resto',
  },
  {
    id: 3,
    name: 'Barbershop Premium',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=600',
    category: 'Services',
  },
];

export default function ClientShowcaseAnimation() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide setiap 3.5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % clientShowcase.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  const currentClient = clientShowcase[currentIndex];

  return (
    <div className="flex justify-center">
      {/* Container Frame HP dengan Carousel Animasi */}
      <div className="relative w-64 overflow-hidden rounded-[2.5rem] border-8 border-slate-900 bg-slate-900 shadow-2xl">
        
        {/* Notch HP Top Bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex justify-center pt-2">
          <div className="h-2 w-16 rounded-full bg-slate-800" />
        </div>

        {/* Slider Foto Animasi */}
        <div className="relative h-96 w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentClient.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <img
                src={currentClient.image}
                alt={currentClient.name}
                className="h-full w-full object-cover"
              />
              
              {/* Overlay Gradient agar Teks Dibawah Jelas */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

              {/* Info Klien di Atas Foto */}
              <div className="absolute bottom-6 inset-x-0 p-4 text-center text-white">
                <span className="inline-block rounded-full bg-amber-500/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  {currentClient.category}
                </span>
                <p className="mt-1 text-sm font-bold">{currentClient.name}</p>
                <p className="text-[10px] text-slate-300">Telah Menggunakan MyReview</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicator Dots di Bawah */}
        <div className="absolute bottom-2 inset-x-0 z-20 flex justify-center gap-1.5">
          {clientShowcase.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'
              }`}
            />
          ))}
        </div>

      </div>
    </div>
  );
}