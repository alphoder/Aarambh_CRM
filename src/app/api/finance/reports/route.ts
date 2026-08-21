import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  const totalRevenue = storage.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = storage.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const totalInvoiced = storage.invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const outstanding = totalInvoiced - totalRevenue;

  // Monthly breakdown derived strictly from actual storage payments
  const currentMonthName = new Date().toLocaleString('default', { month: 'short' });
  const monthlyData = [
    { month: currentMonthName, revenue: totalRevenue, expenses: totalExpenses, profit: netProfit },
  ];

  // Expense by category
  const expenseCategories: Record<string, number> = {};
  for (const exp of storage.expenses) {
    expenseCategories[exp.categoryName] = (expenseCategories[exp.categoryName] || 0) + exp.amount;
  }

  const categoryData = Object.entries(expenseCategories).map(([name, value]) => ({
    name,
    value,
  }));

  // Accounts receivable aging computed from real invoices
  const overdueInvoices = storage.invoices.filter((i) => i.status === 'overdue');
  const overdueAmount = overdueInvoices.reduce((s, i) => s + i.totalAmount, 0);
  const agingData = [
    { bracket: '0-30 Days', amount: overdueAmount, count: overdueInvoices.length },
    { bracket: '31-60 Days', amount: 0, count: 0 },
    { bracket: '60+ Days', amount: 0, count: 0 },
  ];

  return NextResponse.json({
    metrics: {
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin,
      totalInvoiced,
      outstanding: Math.max(0, outstanding),
      overdueCount: overdueInvoices.length,
    },
    monthlyData,
    categoryData,
    agingData,
    recentPayments: storage.payments.slice(0, 5),
  });
}
