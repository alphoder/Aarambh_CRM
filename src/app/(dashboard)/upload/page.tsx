'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Trash2,
  Check,
  Zap,
} from 'lucide-react';

interface ParsedLead {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  designation?: string;
  city?: string;
  state?: string;
  notes?: string;
  estimatedValue?: number;
}

export default function UploadPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [parsing, setParsing] = useState(false);
  const [parseResult, setParseResult] = useState<{
    leads: ParsedLead[];
    modelUsed: string;
    fileName: string;
    productName: string;
  } | null>(null);

  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/leads')
      .then((r) => r.json())
      .then((d) => {
        if (d.products && d.products.length > 0) {
          setProducts(d.products);
          setSelectedProductId(d.products[0].id);
        }
      });
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleParseDocument = async () => {
    if (!file) {
      setError('Please choose or drop an Excel (.xlsx, .csv) or PDF file.');
      return;
    }

    if (!selectedProductId) {
      setError('Please verify and select the target Product.');
      return;
    }

    setParsing(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', selectedProductId);

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to parse file');

      setParseResult({
        leads: data.leads,
        modelUsed: data.modelUsed,
        fileName: data.fileName,
        productName: data.productName,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error parsing file';
      setError(msg);
    } finally {
      setParsing(false);
    }
  };

  const handleRemoveLead = (index: number) => {
    if (!parseResult) return;
    const nextLeads = [...parseResult.leads];
    nextLeads.splice(index, 1);
    setParseResult({ ...parseResult, leads: nextLeads });
  };

  const handleCommitImport = async () => {
    if (!parseResult || parseResult.leads.length === 0) return;
    setImporting(true);

    try {
      // Import leads one by one or in bulk
      for (const lead of parseResult.leads) {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company,
            designation: lead.designation,
            city: lead.city,
            state: lead.state,
            notes: lead.notes,
            value: lead.estimatedValue || 100000,
            productId: selectedProductId,
            source: 'upload',
          }),
        });
      }

      setImportSuccess(true);
      setTimeout(() => {
        router.push('/leads');
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to commit import';
      setError(msg);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">AI File & Lead List Importer</h1>
          <p className="page-subtitle">
            Upload Excel (.xlsx, .csv) or PDF document lists. Google Gemini AI automatically extracts contacts and maps them to your product catalog.
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-4)',
            background: 'var(--accent-red-muted)',
            border: '1px solid var(--accent-red)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-red-light)',
            fontSize: '0.8125rem',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle style={{ width: 16, height: 16 }} />
          <span>{error}</span>
        </div>
      )}

      {importSuccess ? (
        <div
          className="card"
          style={{
            padding: 'var(--space-12)',
            textAlign: 'center',
            background: 'var(--accent-green-muted)',
            borderColor: 'var(--accent-green)',
          }}
        >
          <CheckCircle2 style={{ width: 56, height: 56, color: 'var(--accent-green)', margin: '0 auto var(--space-4)' }} />
          <h2 style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}>Leads Successfully Imported!</h2>
          <p className="text-muted">Redirecting you to the Client Directory...</p>
        </div>
      ) : !parseResult ? (
        /* Upload & Product Verification Step */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', maxWidth: '800px', margin: '0 auto' }}>
          {/* Product Verification Banner */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
              border: '1px solid var(--accent-purple)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles style={{ width: 20, height: 20, color: 'var(--accent-purple-light)' }} />
              <h3 style={{ fontSize: '1rem' }}>Step 1: Verify Target Product / Service</h3>
            </div>
            <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-4)' }}>
              Select which product or service this list is for. The AI uses this context to classify and enrich lead intent.
            </p>

            <select
              className="select"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  📦 {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop File Zone */}
          <div
            className={`dropzone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls,.csv,.pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            <UploadCloud className="dropzone-icon" />

            {file ? (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--accent-blue-light)', fontSize: '1.125rem' }}>
                  {file.name}
                </div>
                <div className="text-muted text-sm" style={{ marginTop: '4px' }}>
                  {(file.size / 1024).toFixed(1)} KB • Ready for Gemini AI Extraction
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.125rem' }}>
                  Drag & Drop Excel or PDF files here
                </div>
                <div className="text-muted text-sm" style={{ marginTop: '6px' }}>
                  Supports .XLSX, .XLS, .CSV, and .PDF documents with multi-column contacts
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleParseDocument}
              className="btn btn-primary btn-lg"
              disabled={!file || parsing}
              style={{ minWidth: '220px' }}
            >
              <Zap style={{ width: 18, height: 18 }} />
              <span>{parsing ? 'Gemini AI Extracting...' : 'Parse with Gemini AI'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Parse Preview & Confirmation Step */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Header Info */}
          <div
            className="card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-4) var(--space-6)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                Extracted {parseResult.leads.length} Lead(s) from {parseResult.fileName}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--accent-purple-light)', marginTop: '2px' }}>
                Mapped Product: <b>{parseResult.productName}</b> • Engine: <code>{parseResult.modelUsed}</code>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                onClick={() => setParseResult(null)}
                className="btn btn-secondary btn-sm"
                disabled={importing}
              >
                Re-upload File
              </button>
              <button
                onClick={handleCommitImport}
                className="btn btn-primary btn-sm"
                disabled={importing || parseResult.leads.length === 0}
              >
                <Check style={{ width: 16, height: 16 }} />
                <span>{importing ? 'Importing...' : 'Confirm & Add to CRM'}</span>
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Lead Name</th>
                    <th>Company & Role</th>
                    <th>Phone & Email</th>
                    <th>Location</th>
                    <th>Estimated Value</th>
                    <th>AI Context Notes</th>
                    <th style={{ textAlign: 'right' }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {parseResult.leads.map((lead, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.name}</td>
                      <td>
                        <div>{lead.company || 'Enterprise Lead'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{lead.designation}</div>
                      </td>
                      <td>
                        <div style={{ color: 'var(--accent-blue-light)' }}>{lead.phone || '—'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{lead.email || '—'}</div>
                      </td>
                      <td>
                        {lead.city || 'Mumbai'}, {lead.state || 'Maharashtra'}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-green-light)' }}>
                        ₹{(lead.estimatedValue || 150000).toLocaleString('en-IN')}
                      </td>
                      <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                        {lead.notes || 'Parsed from sheet'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleRemoveLead(idx)}
                          className="btn btn-ghost btn-icon btn-sm"
                          style={{ color: 'var(--accent-red-light)' }}
                        >
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
