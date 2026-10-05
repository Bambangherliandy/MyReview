import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function POST(request) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Slug wajib disertakan.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('myreview_db');

    // Tambah angka totalScans +1 secara otomatis di MongoDB
    const result = await db.collection('clients').updateOne(
      { slug },
      { 
        $inc: { totalScans: 1 },
        $set: { lastScannedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Klien tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Total scan berhasil diperbarui.',
    });
  } catch (error) {
    console.error('❌ Scan Track Error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}