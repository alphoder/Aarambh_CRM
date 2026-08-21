import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = storage.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // Default to sales executive if new
      const role = cleanEmail.includes('admin') || cleanEmail.includes('vedant') ? 'admin' : 'sales_executive';
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

      user = {
        id: `u-${Date.now()}`,
        name: name,
        email: cleanEmail,
        role: role,
        telegramUsername: email.split('@')[0],
        isActive: true,
      };
      storage.users.push(user);
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        telegramUsername: user.telegramUsername,
      },
    });

    // Set cookie for session
    response.cookies.set('crm_session', JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      telegramUsername: user.telegramUsername,
    }), {
      path: '/',
      httpOnly: false,
      maxAge: 86400 * 30, // 30 days
      sameSite: 'lax',
    });

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown login error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(/crm_session=([^;]+)/);

  if (match && match[1]) {
    try {
      const decoded = decodeURIComponent(match[1]);
      const session = JSON.parse(decoded);
      return NextResponse.json({ user: session });
    } catch {
      // Invalid cookie
    }
  }

  // Default fallback user (Vedant Singh / Admin)
  return NextResponse.json({
    user: storage.users[1] || storage.users[0],
  });
}
