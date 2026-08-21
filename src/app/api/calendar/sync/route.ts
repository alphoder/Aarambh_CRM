import { NextResponse } from 'next/server';
import { storage, FollowUpItem } from '@/lib/storage';

export async function GET() {
  const followUps = [...storage.followUps].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  return NextResponse.json({
    events: followUps,
    total: followUps.length,
    leads: storage.leads.map((l) => ({ id: l.id, name: l.name, phone: l.phone, company: l.company })),
    team: storage.users,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.title || !body.scheduledAt) {
      return NextResponse.json({ error: 'Title and scheduled time are required' }, { status: 400 });
    }

    const lead = body.leadId ? storage.leads.find((l) => l.id === body.leadId) : undefined;
    const user = storage.users.find((u) => u.id === body.userId) || storage.users[0];

    const newFollowUp: FollowUpItem = {
      id: `fu-${Date.now()}`,
      leadId: body.leadId || (storage.leads[0]?.id ?? 'l-1'),
      leadName: lead?.name || body.leadName || 'Client Contact',
      leadPhone: lead?.phone || body.leadPhone || '+91 98000 00000',
      leadCompany: lead?.company || body.leadCompany || 'Enterprise Lead',
      userId: user.id,
      userName: user.name,
      type: body.type || 'call',
      title: body.title,
      description: body.description || '',
      scheduledAt: new Date(body.scheduledAt).toISOString(),
      isCompleted: false,
      reminderSent: false,
      googleEventId: `gcal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    storage.followUps.push(newFollowUp);

    // Add to lead timeline if linked
    if (lead) {
      storage.timeline.unshift({
        id: `t-${Date.now()}`,
        leadId: lead.id,
        userName: user.name,
        type: 'follow_up_scheduled',
        title: `Scheduled ${newFollowUp.type.toUpperCase()}: ${newFollowUp.title}`,
        description: `Set for ${new Date(newFollowUp.scheduledAt).toLocaleString('en-IN')}`,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ success: true, event: newFollowUp });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Schedule error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
