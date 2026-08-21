import { NextResponse } from 'next/server';
import { processPreCallReminders } from '@/lib/scheduler';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const authHeader = req.headers.get('authorization');
  const secret = searchParams.get('secret') || authHeader?.replace('Bearer ', '');

  const expectedSecret = process.env.CRON_SECRET || 'aarmambh_cron_secret_token_9988';

  if (process.env.NODE_ENV !== 'production' || secret === expectedSecret) {
    const result = await processPreCallReminders();
    return NextResponse.json({
      success: true,
      message: '10-Minute pre-call check executed',
      ...result,
      timestamp: new Date().toISOString(),
    });
  }

  return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
}

export async function POST(req: Request) {
  return GET(req);
}
