import { NextResponse } from 'next/server';
import { storage, PaymentItem } from '@/lib/storage';

export async function GET() {
  const payments = [...storage.payments].sort(
    (a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()
  );

  return NextResponse.json({
    payments,
    total: payments.length,
    totalCollected: payments.reduce((s, p) => s + p.amount, 0),
    unpaidInvoices: storage.invoices.filter((i) => i.status !== 'paid'),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.invoiceId || !body.amount) {
      return NextResponse.json({ error: 'Invoice selection and Amount are required' }, { status: 400 });
    }

    const invoice = storage.invoices.find((i) => i.id === body.invoiceId);
    if (!invoice) {
      return NextResponse.json({ error: 'Selected invoice not found' }, { status: 404 });
    }

    const newPayment: PaymentItem = {
      id: `pay-${Date.now()}`,
      invoiceId: invoice.id,
      invoiceNo: invoice.invoiceNo,
      clientName: invoice.clientName,
      amount: Number(body.amount),
      method: body.method || 'bank_transfer',
      referenceNo: body.referenceNo || `TXN-${Date.now().toString().slice(-6)}`,
      notes: body.notes || '',
      paidAt: new Date().toISOString(),
    };

    storage.payments.unshift(newPayment);

    // Auto-update invoice status to paid
    invoice.status = 'paid';
    invoice.paidAt = new Date().toISOString();

    return NextResponse.json({ success: true, payment: newPayment });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Payment error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
