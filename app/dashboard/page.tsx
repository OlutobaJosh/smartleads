import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export default async function Dashboard() {
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f0f0', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#7c3aed' }}>SmartLeads</span>
        <span style={{ fontSize: '0.8rem', color: '#888' }}>{leads?.length || 0} total leads</span>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>Lead Dashboard</h1>
        <p style={{ color: '#888', marginBottom: '32px', fontSize: '0.9rem' }}>All leads automatically scored and processed by AI</p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total Leads', val: leads?.length || 0, color: '#7c3aed' },
            { label: 'Hot Leads (7+)', val: leads?.filter(l => l.ai_score >= 7).length || 0, color: '#ef4444' },
            { label: 'Avg AI Score', val: leads?.length ? (leads.reduce((s,l) => s + (l.ai_score||0), 0) / leads.length).toFixed(1) : 0, color: '#10b981' },
            { label: 'Auto-Replied', val: leads?.length || 0, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px' }}>
              <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</p>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: s.color }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Leads table */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {['Name', 'Business', 'Budget', 'AI Score', 'Summary', 'Date'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads?.map((lead, i) => (
                <tr key={lead.id} style={{ borderBottom: i < leads.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <td style={{ padding: '16px', fontSize: '0.875rem', fontWeight: 600 }}>{lead.name}</td>
                  <td style={{ padding: '16px', fontSize: '0.8rem', color: '#888' }}>{lead.business_type}</td>
                  <td style={{ padding: '16px', fontSize: '0.8rem', color: '#888' }}>{lead.budget}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700,
                      background: (lead.ai_score || 0) >= 7 ? 'rgba(239,68,68,0.15)' : 'rgba(107,114,128,0.15)',
                      color: (lead.ai_score || 0) >= 7 ? '#ef4444' : '#9ca3af'
                    }}>
                      {lead.ai_score || '–'}/10 {(lead.ai_score || 0) >= 7 ? '🔥' : ''}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.78rem', color: '#888', maxWidth: '200px' }}>{lead.ai_summary || '–'}</td>
                  <td style={{ padding: '16px', fontSize: '0.75rem', color: '#555' }}>
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!leads?.length && (
                <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#555' }}>No leads yet. Submit an inquiry on the homepage to test.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}