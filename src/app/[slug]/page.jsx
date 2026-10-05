import clientPromise from '@/lib/db';
import RatingCard from '@/components/RatingCard';
import { notFound } from 'next/navigation';

export default async function RatingPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    notFound();
  }

  const client = await clientPromise;
  const db = client.db('myreview_db');

  // 1. Cari data klien sekaligus tambahkan totalScans +1 secara otomatis
  const clientData = await db.collection('clients').findOneAndUpdate(
    { slug },
    { 
      $inc: { totalScans: 1 },
      $set: { lastScannedAt: new Date() }
    },
    { returnDocument: 'after' }
  );

  if (!clientData) {
    notFound();
  }

  // 2. Convert BSON object dari MongoDB ke plain JSON
  const plainClient = JSON.parse(JSON.stringify(clientData));

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <RatingCard client={plainClient} />
    </main>
  );
}