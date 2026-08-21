'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  UploadCloud,
  Calendar,
  BarChart3,
  IndianRupee,
  Settings,
  Sparkles,
  ShieldCheck,
  Briefcase,
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

export function Sidebar({ userRole = 'admin', userName = 'User' }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = userRole === 'admin';

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/leads', label: 'All Leads', icon: Users },
    { href: '/tasks', label: 'Tasks & Team', icon: CheckSquare },
    { href: '/upload', label: 'AI File Import', icon: UploadCloud },
    { href: '/calendar', label: 'Calendar & Calls', icon: Calendar },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const financeItems = [
    { href: '/finance/invoices', label: 'Invoices' },
    { href: '/finance/payments', label: 'Payments' },
    { href: '/finance/expenses', label: 'Expenses' },
    { href: '/finance/reports', label: 'P&L Reports' },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">A</div>
        <div className="sidebar-brand">
          Aarmambh <span>Labs</span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Core CRM</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Finance Section (Admin Only) */}
        {isAdmin && (
          <>
            <div className="sidebar-section-label" style={{ marginTop: 'var(--space-3)' }}>
              Finance & Accounts
            </div>
            <Link
              href="/finance/invoices"
              className={`sidebar-link ${pathname.startsWith('/finance') ? 'active' : ''}`}
            >
              <IndianRupee />
              <span>Finance Module</span>
            </Link>
            <div style={{ paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {financeItems.map((sub) => (
                <Link
                  key={sub.href}
                  href={sub.href}
                  style={{
                    fontSize: '0.8125rem',
                    padding: '4px 8px',
                    color: pathname === sub.href ? 'var(--accent-blue-light)' : 'var(--text-tertiary)',
                    textDecoration: 'none',
                  }}
                >
                  • {sub.label}
                </Link>
              ))}
            </div>
          </>
        )}

        {/* Settings & Admin */}
        <div className="sidebar-section-label" style={{ marginTop: 'var(--space-3)' }}>
          Administration
        </div>
        <Link
          href="/settings"
          className={`sidebar-link ${pathname === '/settings' ? 'active' : ''}`}
        >
          <Settings />
          <span>Settings & Team</span>
        </Link>
      </nav>

      {/* Footer Role Card */}
      <div className="sidebar-footer">
        <div
          style={{
            background: 'var(--bg-elevated)',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            border: '1px solid var(--border-primary)',
          }}
        >
          {isAdmin ? (
            <ShieldCheck style={{ width: 18, height: 18, color: 'var(--accent-amber-light)' }} />
          ) : (
            <Briefcase style={{ width: 18, height: 18, color: 'var(--accent-blue-light)' }} />
          )}
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {userName}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
              {isAdmin ? 'System Administrator' : 'Sales Executive'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
