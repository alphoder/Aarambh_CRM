'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  MessageSquare,
  Send,
} from 'lucide-react';
import { TaskAssignModal } from '@/components/TaskAssignModal';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedBy: string;
  assignerName: string;
  assignedTo: string;
  assigneeName: string;
  assigneeTelegram?: string;
  leadId?: string;
  leadName?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'done' | 'blocked';
  dueDate?: string;
  createdAt: string;
  commentsCount?: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTasks = () => {
    setLoading(true);
    fetch('/api/tasks')
      .then((res) => res.json())
      .then((data) => setTasks(data.tasks || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTasks();
  };

  const columns = [
    { id: 'todo', label: 'To Do', color: 'var(--text-tertiary)' },
    { id: 'in_progress', label: 'In Progress', color: 'var(--accent-blue-light)' },
    { id: 'done', label: 'Completed', color: 'var(--accent-green-light)' },
    { id: 'blocked', label: 'Blocked', color: 'var(--accent-red-light)' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Work & Task Assignment</h1>
          <p className="page-subtitle">
            Delegate client follow-ups, proposals, and action items with automatic @tagging on Telegram.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          {/* View Mode Toggle */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setViewMode('kanban')}
              className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ height: '28px', padding: '0 8px' }}
            >
              <LayoutGrid style={{ width: 14, height: 14 }} />
              <span>Board</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ height: '28px', padding: '0 8px' }}
            >
              <List style={{ width: 14, height: 14 }} />
              <span>List</span>
            </button>
          </div>

          <button onClick={() => setShowTaskModal(true)} className="btn btn-primary btn-sm">
            <Plus style={{ width: 15, height: 15 }} />
            <span>Assign Work</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>Loading tasks...</div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-4)',
            alignItems: 'start',
          }}
        >
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  minHeight: '400px',
                }}
              >
                {/* Column Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 'var(--space-2)',
                    borderBottom: '1px solid var(--border-primary)',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: col.color }}>
                    {col.label}
                  </span>
                  <span className="badge badge-gray">{colTasks.length}</span>
                </div>

                {/* Task Cards */}
                {colTasks.length === 0 ? (
                  <div className="text-muted text-xs" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                    No tasks in this lane
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="card"
                      style={{
                        padding: 'var(--space-3)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span className={`badge priority-${task.priority}`}>{task.priority}</span>
                        {task.dueDate && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                            Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>

                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                        {task.title}
                      </div>

                      {task.leadName && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-purple-light)' }}>
                          🔗 {task.leadName}
                        </div>
                      )}

                      {task.description && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {task.description}
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '6px',
                          borderTop: '1px solid var(--border-primary)',
                          marginTop: '4px',
                          fontSize: '0.75rem',
                          color: 'var(--text-tertiary)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User style={{ width: 12, height: 12 }} />
                          <span>{task.assigneeName}</span>
                        </div>

                        {/* Status Quick Switch */}
                        <select
                          style={{
                            background: 'var(--bg-input)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border-primary)',
                            borderRadius: '4px',
                            fontSize: '0.6875rem',
                            padding: '2px 4px',
                          }}
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Completed</option>
                          <option value="blocked">Blocked</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Linked Client</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{task.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        by {task.assignerName}
                      </div>
                    </td>
                    <td>{task.leadName || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{task.assigneeName}</span>
                        {task.assigneeTelegram && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--accent-blue-light)' }}>
                            (@{task.assigneeTelegram})
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge priority-${task.priority}`}>{task.priority}</span>
                    </td>
                    <td>
                      <select
                        style={{
                          background: 'var(--bg-input)',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-primary)',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          padding: '3px 6px',
                        }}
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      >
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="done">Completed</option>
                        <option value="blocked">Blocked</option>
                      </select>
                    </td>
                    <td>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showTaskModal && (
        <TaskAssignModal onClose={() => setShowTaskModal(false)} onSuccess={() => fetchTasks()} />
      )}
    </div>
  );
}
