import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Gunakan 'jose' yang kompatibel dengan Edge Runtime Next.js

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Izinkan akses bebas ke halaman login admin & API login admin
  if (pathname === '/admin/login' || pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  // Ambil token admin dari cookie
  const adminToken = request.cookies.get('admin_token')?.value;

  if (!adminToken) {
    // Jika mengakses halaman UI admin tanpa token, redirect ke /admin/login
    if (!pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    // Jika mengakses API admin tanpa token, return JSON 401
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Akses Admin Diperlukan.' },
      { status: 401 }
    );
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
    await jwtVerify(adminToken, secret);
    return NextResponse.next();
  } catch (err) {
    // Token kadaluarsa / invalid
    if (!pathname.startsWith('/api/')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.json(
      { success: false, message: 'Session admin kadaluarsa.' },
      { status: 401 }
    );
  }
}

// Hanya proteksi route admin
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};