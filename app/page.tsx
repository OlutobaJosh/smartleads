'use client';
import { useState } from 'react';

export default function Home() {
  const [form, setForm] = useState({
    name: '', email: '', businessType: '', budget: '', message: ''
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (e) => setForm(f => ({...f, [e.target.name]: e.target.value}));

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    await fetch('/api/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0f', color: '#f0f0f0', fontFamily: 'system-ui, sans-serif' }}>
      {/* Nav */}
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#7c3aed' }}>SmartLeads</span>
        <a href="/dashboard" style={{ color: '#a78bfa', textDecoration: 'none', fontSize: '0.875rem' }}>Dashboard →</a>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '6px 16px', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: '100px', fontSize: '0.75rem', color: '#a78bfa', marginBottom: '24px', letterSpacing: '0.1em' }}>
          AI-POWERED AUTOMATION
        </div>
        <h1 style={{ fontSize: 'clamp(2.5rem,6vw,4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.02em' }}>
          Never miss a hot lead again.
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#888', lineHeight: 1.7, maxWidth: '560px', margin: '0 auto 48px' }}>
          SmartLeads uses AI to instantly score, qualify, and respond to every business inquiry — automatically. No manual work required.
        </p>

        {/* How it works */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '64px' }}>
          {[
            { icon: '📝', step: '01', title: 'Inquiry comes in', desc: 'Client fills your contact form' },
            { icon: '🤖', step: '02', title: 'AI qualifies it', desc: 'Groq AI scores and analyses the lead' },
            { icon: '✉️', step: '03', title: 'Auto-reply sent', desc: 'Personalised email sent in seconds' },
            { icon: '📊', step: '04', title: 'Dashboard updated', desc: 'Lead logged with score and summary' },
          ].map(s => (
            <div key={s.step} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '24px', textAlign: 'left' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{s.icon}</div>
              <div style={{ fontSize: '0.65rem', color: '#7c3aed', fontWeight: 700, letterSpacing: '0.15em', marginBottom: '6px' }}>STEP {s.step}</div>
              <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '0.95rem' }}>{s.title}</div>
              <div style={{ fontSize: '0.8rem', color: '#666' }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        {sent ? (
          <div style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>✅</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px' }}>Inquiry received!</h3>
            <p style={{ color: '#888' }}>Check your email — our AI has already sent you a personalised response.</p>
          </div>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '40px', textAlign: 'left', maxWidth: '560px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>Try it live</h2>
            <p style={{ color: '#888', fontSize: '0.875rem', marginBottom: '28px' }}>Submit an inquiry and watch the AI respond in under 10 seconds.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Your Name', name: 'name', type: 'text', placeholder: 'John Smith' },
                { label: 'Email Address', name: 'email', type: 'email', placeholder: 'john@company.com' },
              ].map(f => (
                <div key={f.name}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                  <input name={f.name} type={f.type} placeholder={f.placeholder} value={form[f.name]} onChange={set}
                    style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0f0f0', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }} />
                </div>
              ))}

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Business Type</label>
                <select name="businessType" value={form.businessType} onChange={set}
                  style={{ width: '100%', padding: '11px 14px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0f0f0', fontSize: '0.875rem', fontFamily: 'inherit' }}>
                  <option value="">Select type...</option>
                  <option>E-commerce Store</option>
                  <option>SaaS / Software</option>
                  <option>Agency / Consultancy</option>
                  <option>Real Estate</option>
                  <option>Healthcare</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Budget Range</label>
                <select name="budget" value={form.budget} onChange={set}
                  style={{ width: '100%', padding: '11px 14px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0f0f0', fontSize: '0.875rem', fontFamily: 'inherit' }}>
                  <option value="">Select budget...</option>
                  <option>Under $100</option>
                  <option>$100 – $500</option>
                  <option>$500 – $1,000</option>
                  <option>$1,000 – $5,000</option>
                  <option>$5,000+</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Project Description</label>
                <textarea name="message" placeholder="Tell us about your project..." value={form.message} onChange={set} rows={4}
                  style={{ width: '100%', padding: '11px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f0f0f0', fontSize: '0.875rem', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>

              <button onClick={submit} disabled={loading || !form.name || !form.email}
                style={{ width: '100%', padding: '14px', background: loading ? '#444' : 'linear-gradient(135deg, #7c3aed, #9d5cf6)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Processing with AI...' : '⚡ Submit Inquiry →'}
              </button>
              <p style={{ fontSize: '0.72rem', color: '#555', textAlign: 'center' }}>Watch your inbox — AI responds in under 10 seconds</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}