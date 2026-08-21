import { NextResponse } from 'next/server';
import { storage, InvoiceItem } from '@/lib/storage';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  let results = [...storage.invoices];

  if (status && status !== 'all') {
    results = results.filter((i) => i.status === status);
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalInvoiced = storage.invoices.reduce((s, i) => s + i.totalAmount, 0);
  const totalPaid = storage.invoices
    .filter((i) => i.status === 'paid')
    .reduce((s, i) => s + i.totalAmount, 0);
  const totalOverdue = storage.invoices
    .filter((i) => i.status === 'overdue')
    .reduce((s, i) => s + i.totalAmount, 0);

  return NextResponse.json({
    invoices: results,
    total: results.length,
    metrics: { totalInvoiced, totalPaid, totalOverdue },
    clients: storage.leads.map((l) => ({ id: l.id, name: l.name, company: l.company })),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.clientName || !body.amount) {
      return NextResponse.json({ error: 'Client name and Amount are required' }, { status: 400 });
    }

    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const count = storage.invoices.length + 1;
    const invoiceNo = `INV-${yearMonth}-${String(count).padStart(3, '0')}`;

    const amount = Number(body.amount) || 0;
    const tax = Number(body.tax) || 0;
    const discount = Number(body.discount) || 0;
    const totalAmount = amount + tax - discount;

    const newInvoice: InvoiceItem = {
      id: `inv-${Date.now()}`,
      invoiceNo,
      leadId: body.leadId || undefined,
      clientName: body.clientName,
      amount,
      tax,
      discount,
      totalAmount,
      status: body.status || 'draft',
      dueDate: body.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      notes: body.notes || '',
      lineItems: body.lineItems || [{ description: 'CRM Platform License & Deployment', quantity: 1, rate: amount, amount }],
      createdAt: new Date().toISOString(),
    };

    storage.invoices.unshift(newInvoice);

    return NextResponse.json({ success: true, invoice: newInvoice });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invoice creation error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
