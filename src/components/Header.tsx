'use client';

import React, { useState, useEffect } from 'react';
import { Search, Bell, Plus, Sparkles, User, Check, X, Shield } from 'lucide-react';
import { TaskAssignModal } from './TaskAssignModal';
import { BholaFloatingChat } from './BholaFloatingChat';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showBholaModal, setShowBholaModal] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [currentUser, setCurrentUser] = useState<{ name: string; role: string; email: string }>({
    name: 'Vedant Singh',
    role: 'admin',
    email: 'vedant@aarmambh.com',
  });

  useEffect(() => {
    // Fetch session user
    fetch('/api/auth/login')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});

    // Mock initial notifications
    setNotifications([
      {
        id: '1',
        title: 'New Lead Assigned',
        message: 'Amitabh Verma (Apex Tech Solutions) was assigned to you.',
        type: 'lead',
        isRead: false,
        createdAt: '5m ago',
      },
      {
        id: '2',
        title: 'Task Assigned',
        message: '@admin assigned you: "Share updated commercial proposal with Amitabh Verma"',
        type: 'task',
        isRead: false,
        createdAt: '25m ago',
      },
      {
        id: '3',
        title: 'Call Reminder in 10 Min',
        message: 'Call scheduled with Sunita Rao (Zenith Logistics) at 11:30 AM',
        type: 'lead',
        isRead: true,
        createdAt: '2h ago',
      },
    ]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  // Quick switch role for pairing testing
  const switchRole = async (newRole: 'admin' | 'sales_executive') => {
    const email = newRole === 'admin' ? 'vedant@aarmambh.com' : 'rahul@aarmambh.com';
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    window.location.reload();
  };

  return (
    <>
      <header className="header">
        {/* Search Bar */}
        <div className="header-search">
          <Search />
          <input
            type="text"
            className="input"
            placeholder="Search leads, tasks, phone numbers..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                window.location.href = `/leads?search=${encodeURIComponent(
                  (e.target as HTMLInputElement).value
                )}`;
              }
            }}
          />
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Quick-Ask Bhola Button */}
          <button
            onClick={() => setShowBholaModal(true)}
            className="btn btn-secondary btn-sm"
            style={{
              borderColor: 'var(--accent-purple)',
              color: 'var(--accent-purple-light)',
              background: 'var(--accent-purple-muted)',
            }}
          >
            <Sparkles style={{ width: 15, height: 15 }} />
            <span>Ask /bhola AI</span>
          </button>

          {/* Quick Assign Task Button */}
          <button onClick={() => setShowTaskModal(true)} className="btn btn-primary btn-sm">
            <Plus style={{ width: 16, height: 16 }} />
            <span>Assign Task</span>
          </button>

          {/* Notifications Bell */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn btn-secondary btn-icon btn-sm header-notification"
              aria-label="Notifications"
            >
              <Bell style={{ width: 16, height: 16 }} />
              {unreadCount > 0 && <span className="header-notification-badge">{unreadCount}</span>}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div
                style={{
                  position: 'absolute',
                  top: '44px',
                  right: 0,
                  width: '320px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xl)',
                  zIndex: 100,
                  padding: 'var(--space-4)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 'var(--space-3)',
                    borderBottom: '1px solid var(--border-primary)',
                    paddingBottom: 'var(--space-2)',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Notifications</span>
                  <button
                    onClick={markAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-blue-light)',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        padding: 'var(--space-2) var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        background: n.isRead ? 'transparent' : 'var(--bg-elevated)',
                        border: '1px solid var(--border-primary)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{n.title}</span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{n.createdAt}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontSize: '0.75rem' }}>
                        {n.message}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Account / Role Switcher */}
          <div className="header-user" title={`Logged in as ${currentUser.name}`}>
            <div className="header-avatar">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div className="header-user-info">
              <span className="header-user-name">{currentUser.name}</span>
              <span className="header-user-role">
                {currentUser.role === 'admin' ? '🛡️ Admin' : '💼 Sales Exec'}
              </span>
            </div>
            <select
              style={{
                background: 'var(--bg-input)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '4px',
                fontSize: '0.6875rem',
                padding: '2px 4px',
                marginLeft: '4px',
                cursor: 'pointer',
              }}
              value={currentUser.role}
              onChange={(e) => switchRole(e.target.value as 'admin' | 'sales_executive')}
            >
              <option value="admin">Admin</option>
              <option value="sales_executive">Sales Exec</option>
            </select>
          </div>
        </div>
      </header>

      {/* Task Assignment Modal */}
      {showTaskModal && (
        <TaskAssignModal onClose={() => setShowTaskModal(false)} />
      )}

      {/* Floating /bhola AI Assistant Modal */}
      {showBholaModal && (
        <BholaFloatingChat onClose={() => setShowBholaModal(false)} userRole={currentUser.role} />
      )}
    </>
  );
}
