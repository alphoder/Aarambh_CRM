'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Target,
  BarChart2,
  PieChart as PieIcon,
  Award,
  ArrowUpRight,
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

interface AnalyticsData {
  metrics: {
    totalLeads: number;
    wonLeads: number;
    lostLeads: number;
    conversionRate: number;
    totalPipelineValue: number;
    activeTasks: number;
  };
  funnelStages: Array<{ stage: string; count: number; value: number }>;
  sourceData: Array<{ name: string; count: number }>;
  productData: Array<{ name: string; count: number }>;
  teamPerformance: Array<{
    id: string;
    name: string;
    role: string;
    assignedLeadsCount: number;
    dealsWon: number;
    revenueGenerated: number;
    tasksCompleted: number;
  }>;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Pipeline & Team Analytics</h1>
          <p className="page-subtitle">
            Conversion funnel breakdown, lead acquisition channels, product performance, and team activity leaderboards.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-blue-muted)', color: 'var(--accent-blue-light)' }}>
            <Users />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Leads Tracked</span>
            <span className="kpi-value">{loading ? '...' : data?.metrics.totalLeads}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-green-muted)', color: 'var(--accent-green-light)' }}>
            <Award />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Conversion Rate</span>
            <span className="kpi-value">{loading ? '...' : `${data?.metrics.conversionRate}%`}</span>
            <span className="kpi-change positive">Industry High</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-purple-muted)', color: 'var(--accent-purple-light)' }}>
            <Target />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Pipeline Deal Value</span>
            <span className="kpi-value">₹{loading ? '...' : (data?.metrics.totalPipelineValue || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-amber-muted)', color: 'var(--accent-amber-light)' }}>
            <TrendingUp />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Deals Closed Won</span>
            <span className="kpi-value">{loading ? '...' : data?.metrics.wonLeads}</span>
          </div>
        </div>
      </div>

      {/* Funnel & Channels Grid */}
      <div className="grid-2" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Conversion Funnel */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
            Lead Conversion Funnel Stages
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.funnelStages || []} layout="vertical">
                <XAxis type="number" stroke="var(--text-tertiary)" />
                <YAxis dataKey="stage" type="category" stroke="var(--text-tertiary)" width={110} />
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }} />
                <Bar dataKey="count" name="Leads Count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Sources Distribution */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
            Acquisition Source Distribution
          </div>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.sourceData || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  dataKey="count"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {(data?.sourceData || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Team Leaderboard */}
      <div className="card">
        <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
          Team Performance & Deal Leaderboard
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Team Member</th>
                <th>Role</th>
                <th>Assigned Leads</th>
                <th>Deals Closed (Won)</th>
                <th>Revenue Generated</th>
                <th>Tasks Completed</th>
              </tr>
            </thead>
            <tbody>
              {data?.teamPerformance.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                  </td>
                  <td>
                    <span className="badge badge-purple">{u.role.replace('_', ' ').toUpperCase()}</span>
                  </td>
                  <td>{u.assignedLeadsCount} clients</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-green-light)' }}>{u.dealsWon} deals</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-blue-light)' }}>
                    ₹{u.revenueGenerated.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span className="badge badge-green">{u.tasksCompleted} tasks done</span>
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
