import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET: Ambil daftar klien
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('myreview_db');
    const clientsList = await db.collection('clients').find({}).toArray();

    const clientsData = {};
    clientsList.forEach((item) => {
      // Sembunyikan hash password dari response client-side untuk keamanan
      const { password, ...clientWithoutPassword } = item;
      clientsData[item.slug] = clientWithoutPassword;
    });

    return NextResponse.json({ success: true, data: clientsData });
  } catch (error) {
    console.error('❌ GET API Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST: Tambah / Update data klien + credentials
export async function POST(request) {
  try {
    const body = await request.json();
    const { slug, name, logo, googleMapsUrl, whatsappNumber, email, password } = body;

    if (!slug || !name || !googleMapsUrl || !whatsappNumber) {
      return NextResponse.json(
        { success: false, message: 'Semua field utama wajib diisi!' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('myreview_db');

    // Cek apakah data klien sudah ada
    const existingClient = await db.collection('clients').findOne({ slug });

    const updatePayload = {
      slug,
      name,
      logo: logo || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200',
      googleMapsUrl,
      whatsappNumber,
      email: email || `${slug}@myreview.com`, // Default email dari slug jika kosong
      updatedAt: new Date(),
    };

    // Jika password diisi, hash password dengan bcrypt
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updatePayload.password = hashedPassword;
    } else if (!existingClient) {
      // Jika tambah baru tapi password kosong, berikan password default
      updatePayload.password = await bcrypt.hash('123456', 10);
    }

    await db.collection('clients').updateOne(
      { slug },
      { $set: updatePayload },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Data klien dan kredensial akun berhasil disimpan!',
    });
  } catch (error) {
    console.error('❌ POST API Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// app/api/admin/clients/route.js

export async function DELETE(request) {
  try {
    const slug = new URL(request.url).searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { success: false, message: 'Slug wajib diisi.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('myreview_db');

    // Hapus dokumen berdasarkan slug
    const result = await db.collection('clients').deleteOne({ slug });

    // Jika tidak ada dokumen yang terhapus (slug tidak ditemukan)
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Klien tidak ditemukan.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Klien berhasil dihapus.',
    });
  } catch (error) {
    console.error('❌ DELETE API Error:', error.message);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}