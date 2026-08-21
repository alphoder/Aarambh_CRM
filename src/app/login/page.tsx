'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('vedant@aarmambh.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      router.push('/');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid credentials';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const quickDemoLogin = (role: 'admin' | 'sales') => {
    const demoEmail = role === 'admin' ? 'vedant@aarmambh.com' : 'rahul@aarmambh.com';
    setEmail(demoEmail);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-logo">
          <div className="login-logo-icon">A</div>
          <h1>
            Aarmambh <span>Labs</span> CRM
          </h1>
          <p>Enterprise Lead, Task & Finance Intelligence</p>
        </div>

        {error && (
          <div
            style={{
              padding: 'var(--space-3)',
              background: 'var(--accent-red-muted)',
              border: '1px solid var(--accent-red)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-red-light)',
              fontSize: '0.8125rem',
              marginBottom: 'var(--space-4)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label>Work Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: 'var(--text-tertiary)',
                }}
              />
              <input
                type="email"
                className="input"
                style={{ paddingLeft: '38px' }}
                placeholder="name@aarmambh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: 'var(--text-tertiary)',
                }}
              />
              <input
                type="password"
                className="input"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </form>

        {/* Demo Fast Login Switchers */}
        <div
          style={{
            marginTop: 'var(--space-6)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--border-primary)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
            Quick Demo Accounts:
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => quickDemoLogin('admin')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              <Shield style={{ width: 13, height: 13, color: 'var(--accent-amber-light)' }} />
              <span>Admin (Vedant)</span>
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('sales')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              <span>Sales Exec (Rahul)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
