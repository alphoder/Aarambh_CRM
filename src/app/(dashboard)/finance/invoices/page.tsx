'use client';

import React, { useState, useEffect } from 'react';
import {
  IndianRupee,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  X,
  Send,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNo: string;
  clientName: string;
  amount: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [metrics, setMetrics] = useState({ totalInvoiced: 0, totalPaid: 0, totalOverdue: 0 });
  const [clients, setClients] = useState<Array<{ id: string; name: string; company: string }>>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    amount: '',
    tax: '0',
    discount: '0',
    dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
    notes: 'Payment due within 15 days via NEFT/UPI/Bank Transfer.',
  });

  const fetchInvoices = () => {
    setLoading(true);
    fetch('/api/finance/invoices')
      .then((r) => r.json())
      .then((d) => {
        setInvoices(d.invoices || []);
        if (d.metrics) setMetrics(d.metrics);
        if (d.clients) {
          setClients(d.clients);
          if (d.clients.length > 0 && !formData.clientName) {
            setFormData((prev) => ({ ...prev, clientName: `${d.clients[0].name} (${d.clients[0].company})` }));
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.amount) return;

    await fetch('/api/finance/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: formData.clientName,
        amount: Number(formData.amount),
        tax: Number(formData.tax),
        discount: Number(formData.discount),
        dueDate: formData.dueDate,
        notes: formData.notes,
        status: 'sent',
      }),
    });

    setShowCreateModal(false);
    setFormData({
      clientName: clients[0]?.name || '',
      amount: '',
      tax: '0',
      discount: '0',
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      notes: 'Payment due within 15 days.',
    });
    fetchInvoices();
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Invoices & Billing</h1>
          <p className="page-subtitle">
            Create client invoices, track accounts receivable, and trigger payment reminders on Telegram.
          </p>
        </div>

        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
          <Plus style={{ width: 15, height: 15 }} />
          <span>Generate Invoice</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-blue-muted)', color: 'var(--accent-blue-light)' }}>
            <IndianRupee />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Invoiced</span>
            <span className="kpi-value">₹{metrics.totalInvoiced.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-green-muted)', color: 'var(--accent-green-light)' }}>
            <CheckCircle2 />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Collected Payments</span>
            <span className="kpi-value">₹{metrics.totalPaid.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: 'var(--accent-red-muted)', color: 'var(--accent-red-light)' }}>
            <AlertCircle />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Overdue Outstanding</span>
            <span className="kpi-value">₹{metrics.totalOverdue.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Client Name</th>
                <th>Amount (INR)</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--accent-blue-light)' }}>{inv.invoiceNo}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.clientName}</div>
                      {inv.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{inv.notes}</div>}
                    </td>
                    <td style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      ₹{inv.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem' }}>{inv.dueDate}</span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          inv.status === 'paid'
                            ? 'badge-green'
                            : inv.status === 'overdue'
                            ? 'badge-red'
                            : inv.status === 'sent'
                            ? 'badge-blue'
                            : 'badge-gray'
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {new Date(inv.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => window.print()}
                        className="btn btn-ghost btn-sm"
                        title="Print / Save PDF"
                      >
                        <Printer style={{ width: 14, height: 14 }} /> Print PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.125rem' }}>Generate Client Invoice</h3>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-ghost btn-icon btn-sm">
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label>Client / Company Name *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Apex Tech Solutions"
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  required
                />
              </div>

              <div className="grid-3">
                <div className="input-group">
                  <label>Base Amount (INR) *</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="250000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Tax / GST (INR)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="45000"
                    value={formData.tax}
                    onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
                  />
                </div>

                <div className="input-group">
                  <label>Discount (INR)</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="0"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Payment Due Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  required
                />
              </div>

              <div className="input-group">
                <label>Invoice Description / Terms</label>
                <textarea
                  className="textarea"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <IndianRupee style={{ width: 15, height: 15 }} />
                  <span>Issue & Send Invoice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
