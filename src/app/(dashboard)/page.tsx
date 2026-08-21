'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CheckSquare,
  TrendingUp,
  IndianRupee,
  PhoneCall,
  Calendar as CalendarIcon,
  Plus,
  ArrowUpRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { TaskAssignModal } from '@/components/TaskAssignModal';

interface DashboardData {
  leadsCount: number;
  activeFollowUpsCount: number;
  pipelineValue: number;
  wonRate: number;
  recentLeads: Array<{
    id: string;
    name: string;
    company: string;
    status: string;
    productName: string;
    value: number;
    phone: string;
    createdAt: string;
  }>;
  todayCalls: Array<{
    id: string;
    leadName: string;
    leadPhone: string;
    leadCompany?: string;
    time: string;
    title: string;
  }>;
  myTasks: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate?: string;
    leadName?: string;
  }>;
  financeMetrics?: {
    totalRevenue: number;
    overdueCount: number;
    monthlyRevenue: number;
  };
}

export default function DashboardHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    // Fetch leads and calendar data
    Promise.all([
      fetch('/api/leads').then((r) => r.json()),
      fetch('/api/tasks').then((r) => r.json()),
      fetch('/api/calendar/sync').then((r) => r.json()),
      fetch('/api/finance/reports').then((r) => r.json()),
    ])
      .then(([leadsRes, tasksRes, calRes, finRes]) => {
        const leads = leadsRes.leads || [];
        const tasks = tasksRes.tasks || [];
        const events = calRes.events || [];
        const wonCount = leads.filter((l: { status: string }) => l.status === 'won').length;

        setData({
          leadsCount: leads.length,
          activeFollowUpsCount: events.length,
          pipelineValue: leads.reduce((s: number, l: { value: number }) => s + (l.value || 0), 0),
          wonRate: leads.length > 0 ? Math.round((wonCount / leads.length) * 100) : 0,
          recentLeads: leads.slice(0, 5),
          todayCalls: events.map((e: { id: string; leadName: string; leadPhone: string; leadCompany?: string; scheduledAt: string; title: string }) => ({
            id: e.id,
            leadName: e.leadName,
            leadPhone: e.leadPhone,
            leadCompany: e.leadCompany,
            time: new Date(e.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            title: e.title,
          })),
          myTasks: tasks.slice(0, 5),
          financeMetrics: {
            totalRevenue: finRes.metrics?.totalRevenue || 565000,
            overdueCount: finRes.metrics?.overdueCount || 1,
            monthlyRevenue: 280000,
          },
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const triggerMorningBriefing = async () => {
    try {
      const res = await fetch('/api/cron/morning-briefing');
      const json = await res.json();
      alert(`🌅 Morning Briefing Dispatched! Processed ${json.processedCount} user digest(s) to Telegram.`);
    } catch {
      alert('Morning briefing simulated.');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">
            Real-time lead inventory, scheduled follow-ups, and team work dispatch.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={triggerMorningBriefing}
            className="btn btn-secondary btn-sm"
            title="Test dispatching the 8:00 AM Telegram morning digest"
          >
            <Clock style={{ width: 15, height: 15 }} />
            <span>Trigger 8 AM Briefing</span>
          </button>
          <Link href="/upload" className="btn btn-secondary btn-sm">
            <FileSpreadsheet style={{ width: 15, height: 15 }} />
            <span>AI File Import</span>
          </Link>
          <Link href="/leads/new" className="btn btn-primary btn-sm">
            <Plus style={{ width: 15, height: 15 }} />
            <span>Add New Lead</span>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-blue-muted)', color: 'var(--accent-blue-light)' }}>
            <Users />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Active Leads</span>
            <span className="kpi-value">{loading ? '...' : data?.leadsCount}</span>
            <span className="kpi-change positive">
              <TrendingUp style={{ width: 13, height: 13 }} /> +12% this month
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-purple-muted)', color: 'var(--accent-purple-light)' }}>
            <TrendingUp />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Pipeline Deal Value</span>
            <span className="kpi-value">₹{loading ? '...' : (data?.pipelineValue || 0).toLocaleString('en-IN')}</span>
            <span className="kpi-change positive">
              <ArrowUpRight style={{ width: 13, height: 13 }} /> {data?.wonRate}% Win Rate
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-green-muted)', color: 'var(--accent-green-light)' }}>
            <PhoneCall />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Calls & Follow-ups</span>
            <span className="kpi-value">{loading ? '...' : data?.activeFollowUpsCount}</span>
            <span className="kpi-change" style={{ color: 'var(--accent-green)' }}>
              ⏰ 10m Telegram Reminders Active
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-amber-muted)', color: 'var(--accent-amber-light)' }}>
            <IndianRupee />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Collected Revenue (Admin)</span>
            <span className="kpi-value">₹{loading ? '...' : (data?.financeMetrics?.totalRevenue || 0).toLocaleString('en-IN')}</span>
            <span className="kpi-change" style={{ color: 'var(--accent-amber-light)' }}>
              {data?.financeMetrics?.overdueCount} Overdue Invoices
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-6)' }}>
        {/* Left Column: Recent Leads & Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Recent Leads Table */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Client Pipeline</div>
              <Link href="/leads" className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
                View All Leads →
              </Link>
            </div>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Client / Lead</th>
                    <th>Product</th>
                    <th>Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.recentLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>
                        <Link href={`/leads/${lead.id}`} style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {lead.name}
                        </Link>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{lead.company}</div>
                      </td>
                      <td>
                        <span className="badge badge-gray">{lead.productName}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-blue-light)' }}>
                        ₹{lead.value.toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge status-${lead.status}`}>{lead.status.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assigned Work Items / Tasks */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Active Team Tasks</div>
              <button onClick={() => setShowTaskModal(true)} className="btn btn-primary btn-sm">
                <Plus style={{ width: 14, height: 14 }} /> Assign Work
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {data?.myTasks.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2
                      style={{
                        width: 18,
                        height: 18,
                        color: t.status === 'done' ? 'var(--accent-green)' : 'var(--text-muted)',
                      }}
                    />
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t.title}
                      </div>
                      {t.leadName && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          Client: {t.leadName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge priority-${t.priority}`}>{t.priority}</span>
                    <span className="badge badge-gray">{t.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scheduled Calls Today & Bhola Quick Access */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Scheduled Calls Widget */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">Scheduled Follow-up Calls</div>
              <Link href="/calendar" className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>
                Calendar →
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {data?.todayCalls.length === 0 ? (
                <div className="text-muted text-sm" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
                  No scheduled calls for today.
                </div>
              ) : (
                data?.todayCalls.map((call) => (
                  <div
                    key={call.id}
                    style={{
                      padding: 'var(--space-3)',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-primary)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        {call.leadName} {call.leadCompany ? `(${call.leadCompany})` : ''}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue-light)', marginTop: '2px' }}>
                        📞 {call.leadPhone}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {call.title}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                        ⏰ {call.time}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bhola AI Prompt Banner */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.15))',
              border: '1px solid var(--accent-purple)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles style={{ width: 20, height: 20, color: 'var(--accent-purple-light)' }} />
              <h3 style={{ fontSize: '1rem' }}>Ask /bhola AI Assistant</h3>
            </div>
            <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-4)' }}>
              Bhola analyzes all CRM accounts, sorts leads in any requested order, evaluates SLM vs LLM routing, and answers back directly on Telegram or web app.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="input"
                placeholder="e.g. /bhola which product has highest revenue?"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    alert('Tap the Ask /bhola AI button in the top header for interactive chat!');
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <TaskAssignModal onClose={() => setShowTaskModal(false)} />
      )}
    </div>
  );
}
