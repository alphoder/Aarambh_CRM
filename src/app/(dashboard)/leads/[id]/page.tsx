'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Phone,
  Mail,
  Building,
  MapPin,
  Calendar,
  CheckSquare,
  Clock,
  Plus,
  ArrowLeft,
  Trash2,
  FileText,
  User,
  Send,
  MessageSquare,
} from 'lucide-react';
import { TaskAssignModal } from '@/components/TaskAssignModal';

interface LeadData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  address?: string;
  city: string;
  state: string;
  status: string;
  source: string;
  productId: string;
  productName: string;
  assignedTo?: string;
  assigneeName?: string;
  notes?: string;
  value: number;
  createdAt: string;
}

interface TimelineEvent {
  id: string;
  userName?: string;
  type: string;
  title: string;
  description?: string;
  createdAt: string;
}

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lead, setLead] = useState<LeadData | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('note');
  const [submittingNote, setSubmittingNote] = useState(false);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchLeadDetail = () => {
    setLoading(true);
    fetch(`/api/leads/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.lead) setLead(data.lead);
        if (data.timeline) setTimeline(data.timeline);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeadDetail();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!lead) return;
    setStatusUpdating(true);
    try {
      await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchLeadDetail();
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddTimelineNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || submittingNote) return;

    setSubmittingNote(true);
    try {
      await fetch(`/api/leads/${id}/timeline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: noteType,
          title: noteType === 'call' ? 'Call Logged' : noteType === 'meeting' ? 'Meeting Held' : 'Activity Note',
          description: newNote,
        }),
      });
      setNewNote('');
      fetchLeadDetail();
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead record?')) return;
    await fetch(`/api/leads/${id}`, { method: 'DELETE' });
    router.push('/leads');
  };

  if (loading) {
    return <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>Loading lead intelligence...</div>;
  }

  if (!lead) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h3>Lead Not Found</h3>
        <Link href="/leads" className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }}>
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Top Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link href="/leads" className="btn btn-secondary btn-icon btn-sm">
            <ArrowLeft style={{ width: 16, height: 16 }} />
          </Link>
          <div>
            <h1 className="page-title">{lead.name}</h1>
            <p className="page-subtitle">
              {lead.company} {lead.designation ? `• ${lead.designation}` : ''}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button onClick={() => setShowTaskModal(true)} className="btn btn-primary btn-sm">
            <CheckSquare style={{ width: 15, height: 15 }} />
            <span>Assign Task</span>
          </button>
          <button onClick={handleDelete} className="btn btn-danger btn-sm">
            <Trash2 style={{ width: 15, height: 15 }} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid-2" style={{ gridTemplateColumns: '1fr 1.3fr', gap: 'var(--space-6)' }}>
        {/* Left: Lead Profile & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Status Progression Card */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 'var(--space-3)' }}>
              Pipeline Stage
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  disabled={statusUpdating}
                  className={`btn btn-sm ${lead.status === st ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Contact & Deal Info */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
              Contact & Deal Details
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Phone style={{ width: 16, height: 16, color: 'var(--accent-blue-light)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Phone Number</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.phone || 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail style={{ width: 16, height: 16, color: 'var(--accent-purple-light)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Email Address</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.email || 'N/A'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Building style={{ width: 16, height: 16, color: 'var(--accent-amber-light)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Verified Product</div>
                  <div style={{ fontWeight: 600, color: 'var(--accent-purple-light)' }}>{lead.productName}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin style={{ width: 16, height: 16, color: 'var(--accent-green-light)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Location</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {lead.city}, {lead.state}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User style={{ width: 16, height: 16, color: 'var(--accent-cyan)' }} />
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Assigned Teammate</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {lead.assigneeName || 'Unassigned'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Comprehensive Activity Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Add Activity Form */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 'var(--space-3)' }}>
              Log Call or Timeline Activity
            </div>
            <form onSubmit={handleAddTimelineNote} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  className="select"
                  style={{ width: '130px', height: '36px' }}
                  value={noteType}
                  onChange={(e) => setNoteType(e.target.value)}
                >
                  <option value="call">📞 Call</option>
                  <option value="meeting">🤝 Meeting</option>
                  <option value="note">📝 Note</option>
                </select>
                <input
                  type="text"
                  className="input"
                  style={{ height: '36px' }}
                  placeholder="Record summary of discussion, call outcome, next steps..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  required
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={submittingNote}>
                  <Send style={{ width: 14, height: 14 }} /> Post
                </button>
              </div>
            </form>
          </div>

          {/* Timeline Feed */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 'var(--space-4)' }}>
              Activity History & Timeline
            </div>
            <div className="timeline">
              {timeline.length === 0 ? (
                <div className="text-muted text-sm" style={{ padding: 'var(--space-4)' }}>
                  No timeline events recorded yet.
                </div>
              ) : (
                timeline.map((evt) => {
                  const dotColor =
                    evt.type === 'meeting'
                      ? 'purple'
                      : evt.type === 'call'
                      ? 'blue'
                      : evt.type === 'status_change'
                      ? 'green'
                      : 'amber';

                  return (
                    <div key={evt.id} className="timeline-item">
                      <div className={`timeline-dot ${dotColor}`} />
                      <div className="timeline-content">
                        <div className="timeline-time">
                          {new Date(evt.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}{' '}
                          {evt.userName ? `• by ${evt.userName}` : ''}
                        </div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {evt.title}
                        </div>
                        {evt.description && (
                          <div className="timeline-text" style={{ marginTop: '4px' }}>
                            {evt.description}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <TaskAssignModal
          leadId={lead.id}
          leadName={`${lead.name} (${lead.company})`}
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => fetchLeadDetail()}
        />
      )}
    </div>
  );
}
