'use client';

import React, { useState, useEffect } from 'react';
import { IndianRupee, Plus, Receipt, X } from 'lucide-react';

interface Expense {
  id: string;
  categoryName: string;
  amount: number;
  description: string;
  expenseDate: string;
  isApproved: boolean;
  submitterName: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    categoryName: 'Cloud & Infrastructure',
    amount: '',
    expenseDate: new Date().toISOString().slice(0, 10),
  });

  const fetchExpenses = () => {
    setLoading(true);
    fetch('/api/finance/expenses')
      .then((r) => r.json())
      .then((d) => {
        setExpenses(d.expenses || []);
        setTotalAmount(d.totalAmount || 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    await fetch('/api/finance/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    setShowModal(false);
    setFormData({
      description: '',
      categoryName: 'Cloud & Infrastructure',
      amount: '',
      expenseDate: new Date().toISOString().slice(0, 10),
    });
    fetchExpenses();
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Company Expenses</h1>
          <p className="page-subtitle">
            Log compute bills, marketing expenses, tool subscriptions, and track overhead costs.
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
          <Plus style={{ width: 15, height: 15 }} />
          <span>Log Expense</span>
        </button>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)', background: 'var(--accent-amber-muted)', border: '1px solid var(--accent-amber)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--accent-amber-light)', fontWeight: 600 }}>Total Approved Expenses</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
              ₹{totalAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <Receipt style={{ width: 44, height: 44, color: 'var(--accent-amber-light)' }} />
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Amount (INR)</th>
                <th>Date</th>
                <th>Logged By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>Loading...</td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)' }}>No expenses logged.</td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id}>
                    <td><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.description}</div></td>
                    <td><span className="badge badge-purple">{e.categoryName}</span></td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-red-light)' }}>₹{e.amount.toLocaleString('en-IN')}</td>
                    <td>{e.expenseDate}</td>
                    <td>{e.submitterName}</td>
                    <td><span className="badge badge-green">APPROVED</span></td>
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
              <h3 style={{ fontSize: '1.125rem' }}>Log Business Expense</h3>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-icon btn-sm"><X style={{ width: 18, height: 18 }} /></button>
            </div>

            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label>Expense Description *</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g. Neon compute hours + Gemini API tokens"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid-2">
                <div className="input-group">
                  <label>Amount (INR) *</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="25000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="input-group">
                  <label>Category</label>
                  <select
                    className="select"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  >
                    <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                    <option value="Marketing & Lead Generation">Marketing & Lead Gen</option>
                    <option value="Office & Operations">Office & Operations</option>
                    <option value="Tools & Software">Tools & Software</option>
                    <option value="Travel & Client Meetings">Travel & Client Meetings</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Date of Expense</label>
                <input
                  type="date"
                  className="input"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Log Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
