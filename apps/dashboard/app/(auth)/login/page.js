'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

const cardStyle = {
  maxWidth: 420,
  margin: '4rem auto',
  padding: '1.25rem',
  borderRadius: 14,
  background: 'rgba(255,255,255,0.82)',
  border: '1px solid #c7d2da'
};

export default function LoginPage() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo123');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    const res = await signIn('credentials', { email, password, redirect: true, callbackUrl: '/' });
    if (res?.error) {
      setError('Invalid credentials');
    }
  }

  async function handleApprove(event) {
    event.preventDefault();
    setStatus('Approving code...');
    setError('');

    const res = await fetch('/api/cli/device/complete', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ userCode: code })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || 'Could not approve code');
      setStatus('');
      return;
    }
    setStatus('Code approved. Return to your CLI to finish login.');
  }

  return (
    <section style={cardStyle}>
      <h1>Sign in</h1>
      <p>Use your dashboard account to unlock CLI sync.</p>
      <form onSubmit={handleLogin} style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%' }} />
        </label>
        <button type="submit">Sign in</button>
      </form>

      <h2>Approve CLI Device Code</h2>
      <form onSubmit={handleApprove} style={{ display: 'grid', gap: '0.75rem' }}>
        <label>
          User code
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="AB12CD34" style={{ width: '100%', textTransform: 'uppercase' }} />
        </label>
        <button type="submit">Approve</button>
      </form>

      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
      {status ? <p style={{ color: '#0f766e' }}>{status}</p> : null}
    </section>
  );
}
