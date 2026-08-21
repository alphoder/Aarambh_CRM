'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Phone,
  Mail,
  Building,
  CheckSquare,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { TaskAssignModal } from '@/components/TaskAssignModal';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  designation: string;
  city: string;
  status: string;
  source: string;
  productId: string;
  productName: string;
  assignedTo?: string;
  assigneeName?: string;
  value: number;
  createdAt: string;
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [team, setTeam] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [selectedLeadForTask, setSelectedLeadForTask] = useState<{ id: string; name: string } | null>(null);

  const fetchLeads = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (statusFilter !== 'all') params.append('status', statusFilter);
    if (productFilter !== 'all') params.append('productId', productFilter);

    fetch(`/api/leads?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.leads || []);
        if (data.products) setProducts(data.products);
        if (data.team) setTeam(data.team);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, productFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  // Quick export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Company', 'Phone', 'Email', 'Product', 'Status', 'Deal Value (INR)', 'City'];
    const rows = leads.map((l) => [
      `"${l.name}"`,
      `"${l.company}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.productName}"`,
      `"${l.status.toUpperCase()}"`,
      l.value,
      `"${l.city}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aarmambh_leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Client & Lead Directory</h1>
          <p className="page-subtitle">
            Common client inventory categorized by product, assignment, and conversion pipeline.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button onClick={exportToCSV} className="btn btn-secondary btn-sm">
            <Download style={{ width: 15, height: 15 }} />
            <span>Export CSV</span>
          </button>
          <Link href="/upload" className="btn btn-secondary btn-sm">
            <FileSpreadsheet style={{ width: 15, height: 15 }} />
            <span>Import Excel / PDF</span>
          </Link>
          <Link href="/leads/new" className="btn btn-primary btn-sm">
            <Plus style={{ width: 15, height: 15 }} />
            <span>Add Lead</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          gap: 'var(--space-4)',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '240px', display: 'flex', gap: '8px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search
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
              type="text"
              className="input"
              style={{ paddingLeft: '36px' }}
              placeholder="Search by client name, company, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-sm">
            Search
          </button>
        </form>

        {/* Product Filter */}
        <div style={{ minWidth: '180px' }}>
          <select
            className="select"
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
          >
            <option value="all">📦 All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">⚡ All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Client Name & Company</th>
                <th>Contact Details</th>
                <th>Target Product</th>
                <th>Status</th>
                <th>Deal Value</th>
                <th>Assignee</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                    No leads found matching your criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <Link
                        href={`/leads/${lead.id}`}
                        style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}
                      >
                        {lead.name}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {lead.company} {lead.designation ? `• ${lead.designation}` : ''}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        📞 <code>{lead.phone}</code>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{lead.email}</div>
                    </td>
                    <td>
                      <span className="badge badge-purple">{lead.productName}</span>
                    </td>
                    <td>
                      <span className={`badge status-${lead.status}`}>{lead.status.toUpperCase()}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--accent-blue-light)' }}>
                      ₹{lead.value.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        {lead.assigneeName || 'Unassigned'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setSelectedLeadForTask({ id: lead.id, name: lead.name })}
                          className="btn btn-secondary btn-sm"
                          title="Assign work on this lead"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          <CheckSquare style={{ width: 14, height: 14 }} /> Assign
                        </button>
                        <Link href={`/leads/${lead.id}`} className="btn btn-ghost btn-sm">
                          Details →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLeadForTask && (
        <TaskAssignModal
          leadId={selectedLeadForTask.id}
          leadName={selectedLeadForTask.name}
          onClose={() => setSelectedLeadForTask(null)}
          onSuccess={() => fetchLeads()}
        />
      )}
    </div>
  );
}
