'use client';

import React, { useState, useEffect } from 'react';
import { IndianRupee, Plus, CheckCircle2, X } from 'lucide-react';

interface Payment {
  id: string;
  invoiceNo: string;
  clientName: string;
  amount: number;
  method: string;
  referenceNo?: string;
  notes?: string;
  paidAt: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<Array<{ id: string; invoiceNo: string; clientName: string; totalAmount: number }>>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    invoiceId: '',
    amount: '',
    method: 'bank_transfer',
    referenceNo: '',
    notes: 'Full payment received.',
  });

  const fetchPayments = () => {
    setLoading(true);
    fetch('/api/finance/payments')
      .then((r) => r.json())
      .then((d) => {
        setPayments(d.payments || []);
        setTotalCollected(d.totalCollected || 0);
        if (d.unpaidInvoices) {
          setUnpaidInvoices(d.unpaidInvoices);
          if (d.unpaidInvoices.length > 0 && !formData.invoiceId) {
            setFormData((prev) => ({
              ...prev,
              invoiceId: d.unpaidInvoices[0].id,
              amount: String(d.unpaidInvoices[0].totalAmount),
            }));
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.invoiceId || !formData.amount) return;

    await fetch('/api/finance/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setShowModal(false);
    fetchPayments();
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Received Payments</h1>
          <p className="page-subtitle">
            Log client transactions, update invoice clearance status, and track collection methods.
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <Plus style={{ width: 15, height: 15 }} />
          <span>Record Payment</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)', background: 'var(--accent-green-muted)', border: '1px solid var(--accent-green)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--accent-green-light)', fontWeight: 600 }}>Total Collected Revenue</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              ₹{totalCollected.toLocaleString('en-IN')}
            </div>
          </div>
          <CheckCircle2 style={{ width: 44, height: 44, color: 'var(--accent-green)' }} />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Invoice Ref</th>
                <th>Client Name</th>
                <th>Amount Paid (INR)</th>
                <th>Method</th>
                <th>Txn / Ref No</th>
                <th>Date Paid</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>Loading...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>No payments recorded yet.</td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id}>
                    <td><span style={{ fontWeight: 700, color: 'var(--accent-blue-light)' }}>{p.invoiceNo}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.clientName}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-green-light)' }}>₹{p.amount.toLocaleString('en-IN')}</td>
                    <td><span className="badge badge-purple">{p.method.replace('_', ' ').toUpperCase()}</span></td>
                    <td><code>{p.referenceNo || '—'}</code></td>
                    <td>{new Date(p.paidAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.125rem' }}>Record Payment</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon btn-sm"><X style={{ width: 18, height: 18 }} /></button>
            </div>

            <form onSubmit={handleRecordPayment} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label>Select Unpaid Invoice *</label>
                <select
                  className="select"
                  value={formData.invoiceId}
                  onChange={(e) => {
                    const inv = unpaidInvoices.find((i) => i.id === e.target.value);
                    setFormData({ ...formData, invoiceId: e.target.value, amount: String(inv?.totalAmount || '') });
                  }}
                  required
                >
                  {unpaidInvoices.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.invoiceNo} — {i.clientName} (₹{i.totalAmount.toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label>Amount (INR) *</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Payment Method</label>
                  <select
                    className="select"
                    value={formData.method}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  >
                    <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="upi">UPI / QR Code</option>
                    <option value="cheque">Cheque</option>
                    <option value="card">Credit/Debit Card</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Transaction / Reference Number</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. HDFC-NEFT-99881122"
                  value={formData.referenceNo}
                  onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">
                  <IndianRupee style={{ width: 15, height: 15 }} />
                  <span>Clear & Record Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
