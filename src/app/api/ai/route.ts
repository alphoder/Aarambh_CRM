import { NextResponse } from 'next/server';
import { askBhola } from '@/lib/ai/bhola';

export async function POST(req: Request) {
  try {
    const { query, role } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const response = await askBhola(query, role || 'admin');

    return NextResponse.json(response);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'AI Query Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
