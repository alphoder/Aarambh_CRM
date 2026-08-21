import { NextResponse } from 'next/server';
import { storage, LeadItem } from '@/lib/storage';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search')?.toLowerCase() || '';
  const status = searchParams.get('status') || '';
  const productId = searchParams.get('productId') || '';
  const assignedTo = searchParams.get('assignedTo') || '';
  const city = searchParams.get('city')?.toLowerCase() || '';

  let results = [...storage.leads];

  if (search) {
    results = results.filter(
      (l) =>
        l.name.toLowerCase().includes(search) ||
        l.company.toLowerCase().includes(search) ||
        l.email?.toLowerCase().includes(search) ||
        l.phone?.toLowerCase().includes(search)
    );
  }

  if (status && status !== 'all') {
    results = results.filter((l) => l.status === status);
  }

  if (productId && productId !== 'all') {
    results = results.filter((l) => l.productId === productId);
  }

  if (assignedTo && assignedTo !== 'all') {
    results = results.filter((l) => l.assignedTo === assignedTo);
  }

  if (city) {
    results = results.filter((l) => l.city?.toLowerCase().includes(city));
  }

  // Sort by latest updated/created
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    leads: results,
    total: results.length,
    products: storage.products,
    team: storage.users.map((u) => ({ id: u.id, name: u.name, role: u.role })),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.productId) {
      return NextResponse.json(
        { error: 'Lead name and Product selection are required' },
        { status: 400 }
      );
    }

    const product = storage.products.find((p) => p.id === body.productId);
    const assignee = storage.users.find((u) => u.id === body.assignedTo);

    const newLead: LeadItem = {
      id: `l-${Date.now()}`,
      name: body.name,
      email: body.email || '',
      phone: body.phone || '',
      company: body.company || '',
      designation: body.designation || '',
      address: body.address || '',
      city: body.city || 'Mumbai',
      state: body.state || 'Maharashtra',
      status: body.status || 'new',
      source: body.source || 'manual',
      productId: body.productId,
      productName: product?.name || 'General Product',
      assignedTo: body.assignedTo || undefined,
      assigneeName: assignee?.name || undefined,
      notes: body.notes || '',
      value: Number(body.value) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.leads.unshift(newLead);

    // Add initial timeline event
    storage.timeline.unshift({
      id: `t-${Date.now()}`,
      leadId: newLead.id,
      userName: body.creatorName || 'Agent',
      type: 'status_change',
      title: 'Lead Created',
      description: `Lead added manually for product: ${newLead.productName}`,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, lead: newLead });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown lead creation error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
