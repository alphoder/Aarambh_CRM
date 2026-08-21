'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, User, Calendar as CalendarIcon, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TaskAssignModalProps {
  onClose: () => void;
  leadId?: string;
  leadName?: string;
  onSuccess?: () => void;
}

export function TaskAssignModal({ onClose, leadId, leadName, onSuccess }: TaskAssignModalProps) {
  const [team, setTeam] = useState<Array<{ id: string; name: string; role: string; telegramUsername?: string }>>([]);
  const [leads, setLeads] = useState<Array<{ id: string; name: string; company: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    selectedLeadId: leadId || '',
  });

  useEffect(() => {
    // Fetch team & leads
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => {
        if (data.team) {
          setTeam(data.team);
          if (data.team.length > 0 && !formData.assignedTo) {
            setFormData((prev) => ({ ...prev, assignedTo: data.team[0].id }));
          }
        }
        if (data.leads) setLeads(data.leads);
      })
      .catch(() => {});
  }, [formData.assignedTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.assignedTo) {
      setErrorMsg('Please enter a task title and select an assignee.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          assignedTo: formData.assignedTo,
          priority: formData.priority,
          dueDate: formData.dueDate || undefined,
          leadId: formData.selectedLeadId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign task');

      const assignee = team.find((t) => t.id === formData.assignedTo);
      setSuccessMsg(
        `Task assigned successfully! Notified ${assignee?.name || 'teammate'} ${
          assignee?.telegramUsername ? `(@${assignee.telegramUsername})` : ''
        } on Telegram.`
      );

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1800);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to assign task';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>Assign Work / Task</h3>
            <p className="text-muted text-sm">
              Teammate will receive an instant notification with @tag on Telegram and web app.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {successMsg ? (
          <div
            style={{
              padding: 'var(--space-6)',
              background: 'var(--accent-green-muted)',
              border: '1px solid var(--accent-green)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              color: 'var(--accent-green-light)',
            }}
          >
            <CheckCircle2 style={{ width: 36, height: 36, margin: '0 auto var(--space-2)' }} />
            <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{successMsg}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {errorMsg && (
              <div
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  background: 'var(--accent-red-muted)',
                  border: '1px solid var(--accent-red)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--accent-red-light)',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <AlertCircle style={{ width: 16, height: 16 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Task Title */}
            <div className="input-group">
              <label>Task Title *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Follow up on Enterprise SLA proposal"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="input-group">
              <label>Description / Specific Instructions</label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Add background notes, requested discounts, or client talking points..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Teammate & Priority Grid */}
            <div className="grid-2">
              <div className="input-group">
                <label>Assign To Teammate *</label>
                <select
                  className="select"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  required
                >
                  {team.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.role === 'admin' ? 'Admin' : 'Sales'}) {user.telegramUsername ? `• @${user.telegramUsername}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Priority</label>
                <select
                  className="select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>
            </div>

            {/* Linked Client & Due Date Grid */}
            <div className="grid-2">
              <div className="input-group">
                <label>Link to Lead / Client (Optional)</label>
                {leadId ? (
                  <input
                    type="text"
                    className="input"
                    value={leadName || 'Selected Lead'}
                    disabled
                    style={{ opacity: 0.7 }}
                  />
                ) : (
                  <select
                    className="select"
                    value={formData.selectedLeadId}
                    onChange={(e) => setFormData({ ...formData, selectedLeadId: e.target.value })}
                  >
                    <option value="">None / General Task</option>
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.company})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="input-group">
                <label>Due Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                <Send style={{ width: 15, height: 15 }} />
                <span>{loading ? 'Assigning & Notifying...' : 'Assign & Send Alert'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
