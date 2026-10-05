import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    const adminUser = process.env.ADMIN_USER;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUser || !adminPassword) {
      return NextResponse.json(
        { success: false, message: 'Admin belum dikonfigurasi di server.' },
        { status: 503 }
      );
    }

    const userOk = safeEqual(username, adminUser);
    const passOk = safeEqual(password, adminPassword);

    if (!userOk || !passOk) {
      return NextResponse.json(
        { success: false, message: 'Username atau password admin salah!' },
        { status: 401 }
      );
    }

    // Token khusus Admin berlaku 1 hari
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1d' }
    );

    const response = NextResponse.json({
      success: true,
      message: 'Login Admin Berhasil!',
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 hari
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('❌ Admin Login Error:', error.message);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}