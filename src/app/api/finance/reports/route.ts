import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
  const totalRevenue = storage.payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = storage.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  const totalInvoiced = storage.invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const outstanding = totalInvoiced - totalRevenue;

  // Monthly breakdown
  const monthlyData = [
    { month: 'Apr', revenue: 210000, expenses: 45000, profit: 165000 },
    { month: 'May', revenue: 320000, expenses: 60000, profit: 260000 },
    { month: 'Jun', revenue: 280000, expenses: 52000, profit: 228000 },
    { month: 'Jul', revenue: 410000, expenses: 75000, profit: 335000 },
    { month: 'Aug', revenue: totalRevenue, expenses: totalExpenses, profit: netProfit },
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

  // Accounts receivable aging
  const overdueInvoices = storage.invoices.filter((i) => i.status === 'overdue');
  const agingData = [
    { bracket: '0-30 Days', amount: 295000, count: 1 },
    { bracket: '31-60 Days', amount: 171100, count: 1 },
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
