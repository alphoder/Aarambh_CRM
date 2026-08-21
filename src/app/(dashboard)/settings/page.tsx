'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Users,
  Key,
  Bot,
  Plus,
  CheckCircle2,
  Shield,
  Briefcase,
  Layers,
  Send,
  X,
  ExternalLink,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales_executive';
  telegramUsername?: string;
  isActive: boolean;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'team' | 'products' | 'keys' | 'telegram'>('team');
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [geminiKeyCount, setGeminiKeyCount] = useState(0);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    name: '',
    email: '',
    role: 'sales_executive',
    telegramUsername: '',
  });

  // New Product Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [productForm, setProductForm] = useState({ name: '', description: '' });

  // Add Gemini Key
  const [newKey, setNewKey] = useState('');
  const [keyAddedMsg, setKeyAddedMsg] = useState('');

  const fetchSettings = () => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.team) setTeam(d.team);
        if (d.products) setProducts(d.products);
        if (d.geminiKeyCount !== undefined) setGeminiKeyCount(d.geminiKeyCount);
      });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.name || !inviteForm.email) return;

    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_user', ...inviteForm }),
    });

    setShowInviteModal(false);
    setInviteForm({ name: '', email: '', role: 'sales_executive', telegramUsername: '' });
    fetchSettings();
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) return;

    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_product', ...productForm }),
    });

    setShowProductModal(false);
    setProductForm({ name: '', description: '' });
    fetchSettings();
  };

  const handleAddGeminiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_gemini_key', apiKey: newKey }),
    });

    const data = await res.json();
    setNewKey('');
    setKeyAddedMsg(`Added key to Gemini pool. Total active keys: ${data.count}`);
    fetchSettings();
    setTimeout(() => setKeyAddedMsg(''), 3000);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Workspace Settings</h1>
          <p className="page-subtitle">
            Manage your team accounts, product catalog, Google Gemini API key pool, and Telegram bot triggers.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab('team')}
          className={`tab ${activeTab === 'team' ? 'active' : ''}`}
        >
          👥 Team Members ({team.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
        >
          📦 Product Catalog ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('keys')}
          className={`tab ${activeTab === 'keys' ? 'active' : ''}`}
        >
          ⚡ Gemini AI Keys ({geminiKeyCount})
        </button>
        <button
          onClick={() => setActiveTab('telegram')}
          className={`tab ${activeTab === 'telegram' ? 'active' : ''}`}
        >
          🤖 Telegram Bot & /bhola
        </button>
      </div>

      {/* Tab: Team Members */}
      {activeTab === 'team' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Team Roster & Telegram Tags</div>
              <div className="text-muted text-xs">
                Work assigned to teammates triggers direct @username mentions on Telegram.
              </div>
            </div>
            <button onClick={() => setShowInviteModal(true)} className="btn btn-primary btn-sm">
              <Plus style={{ width: 15, height: 15 }} />
              <span>Invite Teammate</span>
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Work Email</th>
                  <th>Role</th>
                  <th>Telegram Handle</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {team.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-amber' : 'badge-purple'}`}>
                        {u.role === 'admin' ? '🛡️ Admin' : '💼 Sales Exec'}
                      </span>
                    </td>
                    <td>
                      {u.telegramUsername ? (
                        <span style={{ color: 'var(--accent-blue-light)' }}>@{u.telegramUsername}</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-green' : 'badge-gray'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Products */}
      {activeTab === 'products' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Product Catalog</div>
              <div className="text-muted text-xs">
                Categorize imported Excel/PDF lead lists to route inquiries to the right team.
              </div>
            </div>
            <button onClick={() => setShowProductModal(true)} className="btn btn-primary btn-sm">
              <Plus style={{ width: 15, height: 15 }} />
              <span>Add Product</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {products.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: 'var(--space-4)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '4px' }}>
                  📦 {p.name}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {p.description || 'No description provided.'}
                </div>
                <div style={{ marginTop: '8px' }}>
                  <span className="badge badge-green">ACTIVE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Gemini AI Keys */}
      {activeTab === 'keys' && (
        <div className="card" style={{ maxWidth: '700px' }}>
          <div className="card-title" style={{ marginBottom: 'var(--space-2)' }}>
            Gemini API Key Pool (Round-Robin)
          </div>
          <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-4)' }}>
            Configure multiple Google Gemini API keys. The CRM automatically rotates through the pool across all document parsing and /bhola AI queries to maximize rate limits.
          </p>

          {keyAddedMsg && (
            <div
              style={{
                padding: 'var(--space-3)',
                background: 'var(--accent-green-muted)',
                border: '1px solid var(--accent-green)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--accent-green-light)',
                fontSize: '0.8125rem',
                marginBottom: 'var(--space-4)',
              }}
            >
              {keyAddedMsg}
            </div>
          )}

          <form onSubmit={handleAddGeminiKey} style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <input
              type="password"
              className="input"
              placeholder="Paste Gemini API Key (AIzaSy...)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Add Key
            </button>
          </form>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            💡 You can also specify comma-separated keys in your <code>.env.local</code> file under <code>GEMINI_API_KEYS="key1,key2"</code>.
          </div>
        </div>
      )}

      {/* Tab: Telegram Bot */}
      {activeTab === 'telegram' && (
        <div className="card" style={{ maxWidth: '750px' }}>
          <div className="card-title" style={{ marginBottom: 'var(--space-2)' }}>
            Telegram Bot & /bhola Assistant
          </div>
          <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-4)' }}>
            Connect your Telegram bot to receive instant task assignment alerts, 10-minute pre-call reminders, and execute live CRM commands using <code>/bhola</code>.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                padding: 'var(--space-4)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                1. Create a Telegram Bot with @BotFather
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Message @BotFather on Telegram, create a new bot using <code>/newbot</code>, and copy your API Token into <code>.env.local</code> under <code>TELEGRAM_BOT_TOKEN</code>.
              </div>
            </div>

            <div
              style={{
                padding: 'var(--space-4)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                2. Set Webhook URL
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Point your webhook to <code>https://your-domain.com/api/telegram/webhook</code> to enable instant <code>/bhola</code> AI answers directly in Telegram.
              </div>
            </div>

            <div
              style={{
                padding: 'var(--space-4)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                3. Automated Cron Reminders
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                • <b>8:00 AM Morning Briefing:</b> <code>/api/cron/morning-briefing</code>
                <br />
                • <b>10-Minute Pre-Call Reminder:</b> <code>/api/cron/call-reminder</code> (checks every minute)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.125rem' }}>Invite Team Member</h3>
              <button onClick={() => setShowInviteModal(false)} className="btn btn-ghost btn-icon btn-sm"><X style={{ width: 18, height: 18 }} /></button>
            </div>

            <form onSubmit={handleInviteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Rahul Sharma"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label>Work Email Address *</label>
                <input
                  type="email"
                  className="input"
                  placeholder="rahul@aarmambh.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label>Role</label>
                  <select
                    className="select"
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as 'admin' | 'sales_executive' })}
                  >
                    <option value="sales_executive">💼 Sales Executive</option>
                    <option value="admin">🛡️ System Administrator</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Telegram Username (for @tags)</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. rahul_sales"
                    value={inviteForm.telegramUsername}
                    onChange={(e) => setInviteForm({ ...inviteForm, telegramUsername: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowInviteModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Create & Invite Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.125rem' }}>Add Product to Catalog</h3>
              <button onClick={() => setShowProductModal(false)} className="btn btn-ghost btn-icon btn-sm"><X style={{ width: 18, height: 18 }} /></button>
            </div>

            <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label>Product / Service Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. AI Workflow Automation"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label>Description & Target Market</label>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder="Brief description of features and target pricing tier..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
