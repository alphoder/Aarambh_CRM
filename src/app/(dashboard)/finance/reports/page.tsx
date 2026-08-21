'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  IndianRupee,
  PieChart as PieIcon,
  BarChart2,
  Calendar,
  Download,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface FinanceReportData {
  metrics: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    totalInvoiced: number;
    outstanding: number;
  };
  monthlyData: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
  categoryData: Array<{ name: string; value: number }>;
  agingData: Array<{ bracket: string; amount: number; count: number }>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function FinanceReportsPage() {
  const [data, setData] = useState<FinanceReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/finance/reports')
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">P&L & Financial Reports</h1>
          <p className="page-subtitle">
            Executive cashflow, revenue vs expenses breakdown, profit margins, and accounts receivable aging.
          </p>
        </div>

        <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
          <Download style={{ width: 15, height: 15 }} />
          <span>Export P&L Report</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-blue-muted)', color: 'var(--accent-blue-light)' }}>
            <IndianRupee />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Gross Revenue</span>
            <span className="kpi-value">₹{loading ? '...' : (data?.metrics.totalRevenue || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-red-muted)', color: 'var(--accent-red-light)' }}>
            <TrendingUp />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Expenses</span>
            <span className="kpi-value">₹{loading ? '...' : (data?.metrics.totalExpenses || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-green-muted)', color: 'var(--accent-green-light)' }}>
            <CheckCircle2 />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Net Profit</span>
            <span className="kpi-value">₹{loading ? '...' : (data?.metrics.netProfit || 0).toLocaleString('en-IN')}</span>
            <span className="kpi-change positive">{data?.metrics.profitMargin}% Margin</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-amber-muted)', color: 'var(--accent-amber-light)' }}>
            <Calendar />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Outstanding Balance</span>
            <span className="kpi-value">₹{loading ? '...' : (data?.metrics.outstanding || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Monthly Revenue vs Expenses */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
            Monthly Revenue vs Expenses (INR)
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.monthlyData || []}>
                <XAxis dataKey="month" stroke="var(--text-tertiary)" />
                <YAxis stroke="var(--text-tertiary)" />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                <Legend />
                <Bar dataKey="revenue" name="Collected Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category Pie Chart */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
            Expense Distribution by Category
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categoryData || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {(data?.categoryData || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Accounts Receivable Aging Table */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
          Accounts Receivable Aging Summary
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Aging Bracket</th>
                <th>Overdue Invoices Count</th>
                <th>Total Pending Amount (INR)</th>
                <th>Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {data?.agingData.map((a, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.bracket}</td>
                  <td>{a.count} invoice(s)</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-blue-light)' }}>
                    ₹{a.amount.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className={`badge ${a.bracket.includes('60+') ? 'badge-red' : a.bracket.includes('31-60') ? 'badge-amber' : 'badge-green'}`}>
                      {a.bracket.includes('60+') ? 'HIGH RISK' : a.bracket.includes('31-60') ? 'MODERATE' : 'NORMAL'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
