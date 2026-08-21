import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lead = storage.leads.find((l) => l.id === id);

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  const timeline = storage.timeline.filter((t) => t.leadId === id);
  const tasks = storage.tasks.filter((t) => t.leadId === id);
  const followUps = storage.followUps.filter((f) => f.leadId === id);

  return NextResponse.json({
    lead,
    timeline,
    tasks,
    followUps,
    products: storage.products,
    team: storage.users,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = storage.leads.findIndex((l) => l.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  try {
    const body = await req.json();
    const existing = storage.leads[index];

    // Detect status change to add timeline event
    if (body.status && body.status !== existing.status) {
      storage.timeline.unshift({
        id: `t-${Date.now()}`,
        leadId: id,
        userName: body.updaterName || 'Agent',
        type: 'status_change',
        title: `Status updated to ${body.status.toUpperCase()}`,
        description: `Lead progression updated from ${existing.status} to ${body.status}`,
        createdAt: new Date().toISOString(),
      });
    }

    if (body.productId && body.productId !== existing.productId) {
      const prod = storage.products.find((p) => p.id === body.productId);
      if (prod) existing.productName = prod.name;
    }

    if (body.assignedTo && body.assignedTo !== existing.assignedTo) {
      const user = storage.users.find((u) => u.id === body.assignedTo);
      if (user) existing.assigneeName = user.name;
    }

    const updated = {
      ...existing,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    storage.leads[index] = updated;

    return NextResponse.json({ success: true, lead: updated });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Update error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const index = storage.leads.findIndex((l) => l.id === id);

  if (index === -1) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }

  storage.leads.splice(index, 1);
  return NextResponse.json({ success: true });
}
