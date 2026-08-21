import { NextResponse } from 'next/server';
import { storage, ExpenseItem } from '@/lib/storage';

export async function GET() {
  const expenses = [...storage.expenses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({
    expenses,
    total: expenses.length,
    totalAmount: expenses.reduce((s, e) => s + e.amount, 0),
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.description || !body.amount) {
      return NextResponse.json({ error: 'Description and Amount are required' }, { status: 400 });
    }

    const newExpense: ExpenseItem = {
      id: `exp-${Date.now()}`,
      categoryId: body.categoryId || 'ec-1',
      categoryName: body.categoryName || 'General Operations',
      amount: Number(body.amount),
      description: body.description,
      expenseDate: body.expenseDate || new Date().toISOString().slice(0, 10),
      isApproved: true,
      submittedBy: body.submittedBy || 'u-1',
      submitterName: body.submitterName || 'Admin User',
      createdAt: new Date().toISOString(),
    };

    storage.expenses.unshift(newExpense);

    return NextResponse.json({ success: true, expense: newExpense });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Expense error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
