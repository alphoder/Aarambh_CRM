import { NextResponse } from 'next/server';
import { storage, TimelineItem } from '@/lib/storage';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lead = storage.leads.find((l) => l.id === id);

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const newEvent: TimelineItem = {
      id: `t-${Date.now()}`,
      leadId: id,
      userName: body.userName || 'Agent',
      type: body.type || 'note',
      title: body.title || 'Timeline Note Added',
      description: body.description || '',
      createdAt: new Date().toISOString(),
    };

    storage.timeline.unshift(newEvent);

    return NextResponse.json({ success: true, event: newEvent });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Timeline error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
