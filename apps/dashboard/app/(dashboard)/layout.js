import Link from 'next/link';
import { auth } from '../../lib/auth.js';

const navStyle = {
  display: 'flex',
  gap: '1rem',
  padding: '1rem 1.25rem',
  borderBottom: '1px solid #c7d2da',
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(8px)'
};

const linkStyle = {
  color: '#0f172a',
  textDecoration: 'none',
  fontWeight: 600
};

export default async function DashboardLayout({ children }) {
  const session = await auth();

  return (
    <main>
      <nav style={navStyle}>
        <Link href="/" style={linkStyle}>Overview</Link>
        <Link href="/history" style={linkStyle}>History</Link>
        <Link href="/logs" style={linkStyle}>Logs</Link>
        <span style={{ marginLeft: 'auto', color: '#334155' }}>
          {session?.user?.email || 'Signed out'}
        </span>
      </nav>
      <section style={{ padding: '1.25rem' }}>
        {children}
      </section>
    </main>
  );
}
