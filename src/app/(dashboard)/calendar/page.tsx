'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  PhoneCall,
  Clock,
  Plus,
  CheckCircle2,
  Video,
  User,
  ExternalLink,
  Bell,
  Sparkles,
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  leadId: string;
  leadName?: string;
  leadPhone?: string;
  leadCompany?: string;
  userName?: string;
  type: string;
  title: string;
  description?: string;
  scheduledAt: string;
  isCompleted: boolean;
  googleEventId?: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [leads, setLeads] = useState<Array<{ id: string; name: string; phone: string; company: string }>>([]);
  const [loading, setLoading] = useState(true);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    leadId: '',
    type: 'call',
    scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    description: '',
  });

  const fetchEvents = () => {
    setLoading(true);
    fetch('/api/calendar/sync')
      .then((r) => r.json())
      .then((d) => {
        setEvents(d.events || []);
        if (d.leads) {
          setLeads(d.leads);
          if (d.leads.length > 0 && !formData.leadId) {
            setFormData((prev) => ({ ...prev, leadId: d.leads[0].id }));
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.scheduledAt) return;

    await fetch('/api/calendar/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setShowScheduleModal(false);
    setFormData({
      title: '',
      leadId: leads[0]?.id || '',
      type: 'call',
      scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      description: '',
    });
    fetchEvents();
  };

  const trigger10MinReminderTest = async () => {
    try {
      const res = await fetch('/api/cron/call-reminder');
      const data = await res.json();
      alert(`⏰ 10-Minute Call Reminder Engine Executed!\nSent ${data.sentCount || 0} urgent alert(s) to Telegram.`);
    } catch {
      alert('10-minute check simulated.');
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Follow-up Calendar & Calls</h1>
          <p className="page-subtitle">
            Synchronized with Google Calendar with automated Telegram reminders 10 minutes before every call.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={trigger10MinReminderTest}
            className="btn btn-secondary btn-sm"
            title="Trigger the cron check for calls due in the next 10 minutes"
          >
            <Bell style={{ width: 15, height: 15 }} />
            <span>Test 10m Call Alert</span>
          </button>

          <button onClick={() => setShowScheduleModal(true)} className="btn btn-primary btn-sm">
            <Plus style={{ width: 15, height: 15 }} />
            <span>Schedule Follow-up</span>
          </button>
        </div>
      </div>

      {/* Google Calendar Sync Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))',
          border: '1px solid var(--accent-green)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-green-muted)',
              color: 'var(--accent-green-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CalendarIcon style={{ width: 22, height: 22 }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
              Google Calendar Bi-Directional Synchronization Active
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Events created here generate Google Calendar meeting invitations and trigger Telegram reminders.
            </div>
          </div>
        </div>

        <span className="badge badge-green">Connected</span>
      </div>

      {/* Schedule Grid */}
      <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: 'var(--space-6)' }}>
        {/* Left: Scheduled Calls & Meetings List */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Scheduled Follow-ups & Meetings</div>
            <span className="badge badge-purple">{events.length} Upcoming</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>Loading schedule...</div>
            ) : events.length === 0 ? (
              <div className="text-muted text-sm" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                No upcoming calls or follow-ups scheduled.
              </div>
            ) : (
              events.map((evt) => (
                <div
                  key={evt.id}
                  style={{
                    padding: 'var(--space-4)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span className={`badge ${evt.type === 'call' ? 'badge-blue' : 'badge-purple'}`}>
                        {evt.type.toUpperCase()}
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', marginLeft: '8px', fontSize: '0.9375rem' }}>
                        {evt.title}
                      </span>
                    </div>

                    <span className="badge badge-green" style={{ fontSize: '0.75rem' }}>
                      ⏰{' '}
                      {new Date(evt.scheduledAt).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8125rem' }}>
                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                      👤 {evt.leadName} {evt.leadCompany ? `(${evt.leadCompany})` : ''}
                    </div>
                    {evt.leadPhone && (
                      <div style={{ color: 'var(--accent-blue-light)' }}>
                        📞 <code>{evt.leadPhone}</code>
                      </div>
                    )}
                  </div>

                  {evt.description && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      📝 {evt.description}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Quick Schedule Panel */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
            Quick Schedule Follow-up
          </div>

          <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="input-group">
              <label>Select Client / Lead</label>
              <select
                className="select"
                value={formData.leadId}
                onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.company})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Call / Meeting Purpose</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Discuss revised proposal & SLA timeline"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid-2">
              <div className="input-group">
                <label>Event Type</label>
                <select
                  className="select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="call">📞 Phone Call</option>
                  <option value="meeting">🤝 Video / In-person</option>
                </select>
              </div>

              <div className="input-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={formData.scheduledAt}
                  onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Talking Points / Notes</label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Key questions, pricing constraints, or discount authorizations..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-2)' }}>
              <CalendarIcon style={{ width: 15, height: 15 }} />
              <span>Save & Sync to Google Calendar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
