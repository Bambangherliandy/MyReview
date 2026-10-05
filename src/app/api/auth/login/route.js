import { NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan password wajib diisi!' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('myreview_db');

    // Cari klien berdasarkan slug atau email
    const user = await db.collection('clients').findOne({
      $or: [{ slug: username.toLowerCase() }, { email: username.toLowerCase() }],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Username atau password salah!' },
        { status: 401 }
      );
    }

    // Verifikasi Password (bisa plain-text untuk testing awal, atau bcrypt)
    let isMatch = false;
    if (user.password) {
      isMatch = await bcrypt.compare(password, user.password).catch(() => false);
      // Fallback jika di database masih berupa plain text
      if (!isMatch && user.password === password) isMatch = true;
    }

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Username atau password salah!' },
        { status: 401 }
      );
    }

    // Buat Token Session JWT (Berlaku 7 hari)
    const token = jwt.sign(
      { slug: user.slug, name: user.name, role: 'client' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Set Token di HTTP-Only Cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil!',
      slug: user.slug,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('❌ Login Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}