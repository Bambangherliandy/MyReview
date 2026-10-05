import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';

export async function POST(request) {
  try {
    const { slug, rating, comment } = await request.json();

    if (!slug || !rating) {
      return NextResponse.json(
        { success: false, message: 'Slug dan rating wajib diisi!' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('myreview_db');

    const numRating = Number(rating);

    // Kondisi 1: Rating Positif (4-5 Star -> Ke Google Maps)
    if (numRating >= 4) {
      await db.collection('clients').updateOne(
        { slug },
        { $inc: { googleRedirects: 1 } }
      );

      return NextResponse.json({
        success: true,
        message: 'Google redirect tercatat.',
      });
    }

    // Kondisi 2: Rating Masukan/Kritik (1-3 Star -> Ke WA & Simpan ke DB)
    const newFeedback = {
      id: Date.now(),
      rating: numRating,
      comment: comment || 'Tidak ada catatan khusus.',
      date: new Date().toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
      status: 'Need Action',
      createdAt: new Date(),
    };

    await db.collection('clients').updateOne(
      { slug },
      {
        $inc: { waRedirects: 1 },
        $push: { feedbacks: { $each: [newFeedback], $position: 0 } }, // Masukkan ke urutan paling atas
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback privat berhasil disimpan ke database!',
      data: newFeedback,
    });
  } catch (error) {
    console.error('❌ Feedback API Error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}