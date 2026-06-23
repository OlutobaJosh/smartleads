import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, TrendingUp, Flame, Percent, Send, LogOut } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

type Lead = {
  id: string;
  name: string;
  email: string;
  business_type: string;
  budget: string;
  message: string;
  ai_score: number;
  ai_summary: string;
  priority: 'HOT' | 'WARM' | 'COLD';
  status: string;
  ai_email_sent: string;
  created_at: string;
};

const P_STYLE: Record<string, { dot: string; text: string; bg: string }> = {
  HOT:  { dot: '#ef4444', text: '#f87171', bg: 'rgba(239,68,68,0.1)'  },
  WARM: { dot: '#f59e0b', text: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  COLD: { dot: '#60a5fa', text: '#93c5fd', bg: 'rgba(96,165,250,0.1)' },
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default async function AdminPage() {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  const leads: Lead[] = (data ?? []) as Lead[];

  const avgScore = leads.length
    ? Math.round(leads.reduce((s, l) => s + (l.ai_score ?? 0), 0) / leads.length)
    : null;

  const stats = [
    { label: 'Total',        value: leads.length,                                           icon: TrendingUp, color: '#8b5cf6' },
    { label: 'Hot',          value: leads.filter(l => l.priority === 'HOT').length,         icon: Flame,      color: '#ef4444' },
    { label: 'Avg Score',    value: avgScore !== null ? `${avgScore}/100` : '—',             icon: Percent,    color: '#10b981' },
    { label: 'Auto-Replied', value: leads.filter(l => l.ai_email_sent === 'true').length,   icon: Send,       color: '#f59e0b' },
  ];

  return (
    <main style={{ minHeight: '100vh', background: '#06060e', color: '#ededf7', fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 32px', borderBottom: '1px solid rgba(139,92,246,0.14)', background: 'rgba(6,6,14,0.88)', backdropFilter: 'blur(14px)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '0.72rem', color: '#6a6a8a', textDecoration: 'none' }}>
          <ArrowLeft style={{ width: 12, height: 12 }} /> back to app
        </a>
        <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '0.82rem', fontWeight: 700, color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
          SmartLeads · Admin
        </span>
        <form action="/api/admin/login" method="POST" style={{ display: 'flex', alignItems: 'center' }}>
          <a
            href="/api/admin/login"
            onClick={async (e) => {
              e.preventDefault();
              await fetch('/api/admin/login', { method: 'DELETE' });
              window.location.href = '/admin/login';
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '0.65rem', color: '#3a3a5a', textDecoration: 'none', cursor: 'pointer' }}
          >
            <LogOut style={{ width: 11, height: 11 }} /> sign out
          </a>
        </form>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ border: '1px solid rgba(139,92,246,0.12)', background: '#0d0d1e', borderRadius: 12, padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, opacity: 0.5 }}>
                  <Icon style={{ width: 13, height: 13, color: s.color }} />
                  <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '0.62rem', letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{s.label}</span>
                </div>
                <p style={{ fontSize: '2.1rem', fontWeight: 800, color: s.color, lineHeight: 1, margin: 0 }}>{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* Error notice */}
        {error && (
          <div style={{ border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.07)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '0.75rem', color: '#f87171' }}>
            // db error: {error.message}
          </div>
        )}

        {/* Table */}
        <div style={{ border: '1px solid rgba(139,92,246,0.12)', background: 'rgba(13,13,30,0.6)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(139,92,246,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '0.72rem', fontWeight: 700, color: '#8b5cf6' }}>inquiries</span>
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '0.6rem', color: '#3a3a5a' }}>ORDER BY created_at DESC</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(139,92,246,0.08)' }}>
                  {['Name', 'Business', 'Budget', 'Priority', 'Score', 'AI Summary', 'Replied', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#3a3a5a', whiteSpace: 'nowrap' as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '60px 24px', textAlign: 'center', fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '0.75rem', color: '#3a3a5a' }}>
                      No leads yet. Submit an inquiry on the homepage to test the pipeline.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead, i) => {
                    const ps = P_STYLE[lead.priority] ?? P_STYLE.COLD;
                    return (
                      <tr key={lead.id} style={{ borderBottom: i < leads.length - 1 ? '1px solid rgba(139,92,246,0.06)' : 'none' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.83rem' }}>{lead.name}</div>
                          <div style={{ fontSize: '0.68rem', color: '#3a3a5a', marginTop: 2 }}>{lead.email}</div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: '#6a6a8a' }}>{lead.business_type || '—'}</td>
                        <td style={{ padding: '14px 16px', fontSize: '0.78rem', color: '#6a6a8a', whiteSpace: 'nowrap' as const }}>{lead.budget || '—'}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '0.62rem', fontWeight: 700, background: ps.bg, color: ps.text }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: ps.dot, display: 'inline-block' }} />
                            {lead.priority ?? 'COLD'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '1rem', fontWeight: 800, color: ps.text }}>{lead.ai_score ?? '—'}</span>
                            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '0.62rem', color: '#3a3a5a' }}>/100</span>
                          </div>
                          {lead.ai_score != null && (
                            <div style={{ marginTop: 4, height: 2, width: 60, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${lead.ai_score}%`, background: ps.dot, borderRadius: 2 }} />
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: '0.73rem', color: '#6a6a8a', maxWidth: 220, lineHeight: 1.5 }}>
                          <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                            {lead.ai_summary || '—'}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '0.62rem', color: lead.ai_email_sent === 'true' ? '#10b981' : '#3a3a5a' }}>
                            {lead.ai_email_sent === 'true' ? '✓ sent' : '—'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', fontFamily: 'var(--font-geist-mono, monospace)', fontSize: '0.65rem', color: '#3a3a5a', whiteSpace: 'nowrap' as const }}>{fmt(lead.created_at)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
