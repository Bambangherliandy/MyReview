import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 1. Ambil token dari Cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Silakan login kembali.' },
        { status: 401 }
      );
    }

    // 2. Verifikasi Token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const slug = decoded.slug;

    const client = await clientPromise;
    const db = client.db('myreview_db');

    // 3. Ambil data asli klien dari koleksi `clients` MongoDB
    const clientData = await db.collection('clients').findOne({ slug });

    if (!clientData) {
      return NextResponse.json(
        { success: false, message: 'Data klien tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Sembunyikan field password dari response JSON
    const { password, ...safeData } = clientData;

    // 4. Hitung statistik riil dari database (default 0 jika belum ada yang scan/masuk)
    const responseData = {
      ...safeData,
      totalScans: safeData.totalScans || 0,
      googleRedirects: safeData.googleRedirects || 0,
      waRedirects: safeData.waRedirects || 0,
      feedbacks: safeData.feedbacks || [], // Array komplain privat asli dari MongoDB
      
      // Grafik 7 Hari: Menggunakan akumulasi data riil (atau disiapkan format barunya)
      weeklyStats: safeData.weeklyStats || [
        { day: 'Sen', scans: 0, google: 0, wa: 0 },
        { day: 'Sel', scans: 0, google: 0, wa: 0 },
        { day: 'Rab', scans: 0, google: 0, wa: 0 },
        { day: 'Kam', scans: 0, google: 0, wa: 0 },
        { day: 'Jum', scans: 0, google: 0, wa: 0 },
        { day: 'Sab', scans: 0, google: 0, wa: 0 },
        { day: 'Min', scans: 0, google: 0, wa: 0 },
      ],
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error) {
    console.error('❌ Dashboard API Error:', error.message);
    return NextResponse.json(
      { success: false, message: 'Session kadaluarsa atau invalid.' },
      { status: 401 }
    );
  }
}