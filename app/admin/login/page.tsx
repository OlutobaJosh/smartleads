'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  async function handleLogin() {
    if (!password.trim()) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const from = params.get('from') ?? '/admin';
        router.push(from);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? 'Incorrect password.');
        setLoading(false);
      }
    } catch {
      setError('Could not reach the server. Please try again.');
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#06060e',
        color: '#ededf7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 360,
          border: '1px solid rgba(139,92,246,0.14)',
          background: '#0d0d1e',
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        {/* Header bar */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid rgba(139,92,246,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(139,92,246,0.04)',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#8b5cf6',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-geist-mono, monospace)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#8b5cf6',
            }}
          >
            SmartLeads · Admin
          </span>
        </div>

        <div style={{ padding: '28px 24px' }}>
          <p
            style={{
              fontFamily: 'var(--font-geist-mono, monospace)',
              fontSize: '0.72rem',
              color: '#6a6a8a',
              marginBottom: 24,
            }}
          >
            // restricted access — enter admin password
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label
                htmlFor="password"
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 500,
                  color: 'rgba(237,237,247,0.7)',
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{
                  height: 40,
                  width: '100%',
                  background: 'rgba(139,92,246,0.05)',
                  border: '1px solid rgba(139,92,246,0.14)',
                  borderRadius: 8,
                  padding: '0 14px',
                  color: '#ededf7',
                  fontSize: '0.875rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <p
                style={{
                  fontFamily: 'var(--font-geist-mono, monospace)',
                  fontSize: '0.72rem',
                  color: '#f87171',
                  margin: 0,
                }}
              >
                // {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading || !password.trim()}
              style={{
                height: 42,
                background: loading || !password.trim()
                  ? 'rgba(139,92,246,0.3)'
                  : '#8b5cf6',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: loading || !password.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 0.15s',
              }}
            >
              {loading ? (
                <>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 13,
                      height: 13,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite',
                    }}
                  />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
