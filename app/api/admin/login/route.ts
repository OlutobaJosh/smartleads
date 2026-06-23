import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const adminToken = process.env.ADMIN_TOKEN;

    if (!adminToken) {
      return NextResponse.json(
        { error: 'ADMIN_TOKEN environment variable is not set.' },
        { status: 500 }
      );
    }

    if (!password || password !== adminToken) {
      // Constant-time-ish response to prevent timing attacks
      await new Promise(r => setTimeout(r, 300));
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin_token', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  // Sign out: clear the cookie
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('admin_token');
  return res;
}
