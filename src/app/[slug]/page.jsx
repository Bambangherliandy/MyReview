import clientPromise from '@/lib/db';
import RatingCard from '@/components/RatingCard';
import { notFound, redirect } from 'next/navigation';

const isGoogleUrl = (u) =>
  /^https:\/\/(search\.google\.com|www\.google\.com\/maps|maps\.app\.goo\.gl|g\.page)\//.test(u || '');

export default async function RatingPage({ params }) {
  const { slug } = (await params) ?? {};
  if (!slug) notFound();

  const mongo = await clientPromise; // koneksi MongoDB (jangan dinamai "client" supaya tidak tertukar dengan data klien)
  const db = mongo.db('myreview_db');

  // Ambil data klien sekaligus catat scan. Hanya field yang dibutuhkan halaman rating
  // yang dikirim ke browser (email, password/hash, dll. tidak ikut terkirim).
  const clientData = await db.collection('clients').findOneAndUpdate(
    { slug },
    {
      $inc: { totalScans: 1 },
      $set: { lastScannedAt: new Date() },
    },
    {
      returnDocument: 'after',
      projection: {
        _id: 0,
        slug: 1,
        name: 1,
        logo: 1,
        googleMapsUrl: 1,
        whatsappNumber: 1,
        directToGoogle: 1,
        // tambahkan field lain di sini kalau RatingCard memakainya
      },
    }
  );

  if (!clientData) notFound();

  // Opsi "langsung ke Google": scan sudah tercatat di atas, baru dialihkan
  if (clientData.directToGoogle && isGoogleUrl(clientData.googleMapsUrl)) {
    redirect(clientData.googleMapsUrl);
  }

  // Ubah objek BSON dari MongoDB menjadi JSON biasa
  const plainClient = JSON.parse(JSON.stringify(clientData));

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <RatingCard client={plainClient} />
    </main>
  );
}