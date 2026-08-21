'use client';

import React, { useState } from 'react';
import { Sparkles, Send, X, Bot, Zap, Cpu, ArrowRight } from 'lucide-react';

interface BholaFloatingChatProps {
  onClose: () => void;
  userRole?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  modelUsed?: string;
  isLLM?: boolean;
  complexityScore?: number;
}

export function BholaFloatingChat({ onClose, userRole = 'admin' }: BholaFloatingChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '👋 <b>Namaste! I am Bhola</b>, your automated AI Intelligence Assistant with access to all CRM leads, calls, tasks, and financials.\n\nType <code>/bhola &lt;your question&gt;</code> or ask naturally!\n\n💡 <b>Quick Prompts:</b>\n• <i>Show all leads from Mumbai</i>\n• <i>Who has scheduled calls today?</i>\n• <i>Sort leads by deal value descending</i>\n• <i>Give me a summary of active team tasks</i>',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, role: userRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process AI query');

      const botMsg: Message = {
        role: 'assistant',
        content: data.answer,
        modelUsed: data.modelUsed,
        isLLM: data.isLLM,
        complexityScore: data.complexityScore,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Error reaching /bhola';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Sorry, I encountered an issue: ${errorMsg}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: '640px', height: '80vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <Sparkles style={{ width: 16, height: 16 }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Bhola AI Assistant</span>
                <span className="badge badge-purple" style={{ fontSize: '0.625rem' }}>
                  Live CRM Context
                </span>
              </h3>
              <p className="text-muted text-xs">
                Auto-routes between SLM (Flash Lite) & LLM (Flash) based on query complexity.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon btn-sm">
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            overflowX: 'auto',
            paddingBottom: '8px',
            borderBottom: '1px solid var(--border-primary)',
            marginBottom: '8px',
          }}
        >
          {[
            'Calls today',
            'Sort leads by deal value',
            'All leads in Mumbai',
            'Finance P&L summary',
          ].map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', height: '26px', padding: '0 8px', whiteSpace: 'nowrap' }}
            >
              <span>{prompt}</span>
              <ArrowRight style={{ width: 11, height: 11 }} />
            </button>
          ))}
        </div>

        {/* Message Log */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '8px 0',
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                background: m.role === 'user' ? 'var(--accent-blue-muted)' : 'var(--bg-elevated)',
                border: `1px solid ${m.role === 'user' ? 'var(--accent-blue)' : 'var(--border-primary)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3) var(--space-4)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
              }}
            >
              {/* Bot Meta Header */}
              {m.role === 'assistant' && m.modelUsed && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '6px',
                    paddingBottom: '4px',
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '0.6875rem',
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {m.isLLM ? (
                    <span className="badge badge-purple" style={{ display: 'flex', gap: '3px' }}>
                      <Cpu style={{ width: 11, height: 11 }} /> LLM Flash
                    </span>
                  ) : (
                    <span className="badge badge-cyan" style={{ display: 'flex', gap: '3px' }}>
                      <Zap style={{ width: 11, height: 11 }} /> SLM Flash Lite
                    </span>
                  )}
                  <span>Score: {m.complexityScore}/10</span>
                </div>
              )}

              <div
                dangerouslySetInnerHTML={{ __html: m.content.replace(/\n/g, '<br/>') }}
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          ))}

          {loading && (
            <div
              style={{
                alignSelf: 'flex-start',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3) var(--space-4)',
                fontSize: '0.8125rem',
                color: 'var(--accent-purple-light)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div className="animate-spin">⚙️</div>
              <span>Bhola is analyzing full CRM data & routing model...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-primary)',
          }}
        >
          <input
            type="text"
            className="input"
            placeholder="Ask Bhola anything e.g. /bhola sort leads by deal value..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="btn btn-primary btn-icon" disabled={loading || !input.trim()}>
            <Send style={{ width: 16, height: 16 }} />
          </button>
        </form>
      </div>
    </div>
  );
}
