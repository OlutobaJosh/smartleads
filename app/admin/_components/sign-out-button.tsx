'use client';

import { LogOut } from 'lucide-react';

export function SignOutButton() {
  async function handleSignOut() {
    await fetch('/api/admin/login', { method: 'DELETE' });
    window.location.href = '/admin/login';
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: 'var(--font-geist-mono, monospace)',
        fontSize: '0.65rem',
        color: '#3a3a5a',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <LogOut style={{ width: 11, height: 11 }} />
      sign out
    </button>
  );
}
