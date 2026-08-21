'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Sparkles, Building, User, Phone, Mail, MapPin } from 'lucide-react';

export default function NewLeadPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [team, setTeam] = useState<Array<{ id: string; name: string; role: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    designation: '',
    address: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    status: 'new',
    source: 'manual',
    productId: '',
    assignedTo: '',
    notes: '',
    value: '150000',
  });

  useEffect(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          setFormData((prev) => ({ ...prev, productId: data.products[0].id }));
        }
        if (data.team && data.team.length > 0) {
          setTeam(data.team);
          setFormData((prev) => ({ ...prev, assignedTo: data.team[0].id }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.productId) {
      setError('Lead name and Product selection are required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create lead');

      router.push(`/leads/${data.lead.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating lead';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link href="/leads" className="btn btn-secondary btn-icon btn-sm">
            <ArrowLeft style={{ width: 16, height: 16 }} />
          </Link>
          <div>
            <h1 className="page-title">Add New Client / Lead</h1>
            <p className="page-subtitle">
              Verify the target product to ensure accurate pipeline sorting and team assignment.
            </p>
          </div>
        </div>
      </div>

      <div className="card">
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Target Product (Mandatory Verification) */}
          <div
            style={{
              padding: 'var(--space-4)',
              background: 'var(--accent-purple-muted)',
              border: '1px solid var(--accent-purple)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-purple-light)', display: 'block', marginBottom: '6px' }}>
              🎯 Target Product / Service * (Required for sorting)
            </label>
            <select
              className="select"
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Categorizes this client in the unified inventory and routes appropriate follow-up templates.
            </div>
          </div>

          {/* Client Details Grid */}
          <div className="grid-2">
            <div className="input-group">
              <label>Contact Name *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Vikram Malhotra"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="input-group">
              <label>Company / Organization</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Malhotra Infrastructure Ltd"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Phone Number (for Telegram 10m call alerts)</label>
              <input
                type="tel"
                className="input"
                placeholder="+91 98201 12345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="client@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>Designation / Role</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Managing Director / CTO"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Estimated Deal Value (INR)</label>
              <input
                type="number"
                className="input"
                placeholder="150000"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-2">
            <div className="input-group">
              <label>City</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Mumbai"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>

            <div className="input-group">
              <label>Assign To Teammate</label>
              <select
                className="select"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                {team.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === 'admin' ? 'Admin' : 'Sales'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Discovery Notes / Requirements</label>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Key pain points, requested integrations, budget considerations..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <Link href="/leads" className="btn btn-secondary btn-sm">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
              <Save style={{ width: 15, height: 15 }} />
              <span>{loading ? 'Creating...' : 'Save & Open Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
