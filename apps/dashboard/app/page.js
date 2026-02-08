import Link from 'next/link';
import { auth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import { computeStreaks } from '../lib/streak.js';
import { buildRecentDayKeys, dayKey } from '../lib/time.js';

function cardStyle() {
  return {
    border: '1px solid #c7d2da',
    borderRadius: '14px',
    padding: '1rem',
    background: 'rgba(255,255,255,0.72)',
    boxShadow: '0 8px 22px rgba(15, 23, 42, 0.08)'
  };
}

function TinyLineChart({ values }) {
  if (!values.length) return <p>No data yet.</p>;
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => `${(i / Math.max(values.length - 1, 1)) * 100},${100 - (v / max) * 100}`)
    .join(' ');

  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: 120 }}>
      <polyline fill="none" stroke="#0f766e" strokeWidth="2" points={points} />
    </svg>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <section style={{ padding: '2rem' }}>
        <h1>Lazy Typing Dashboard</h1>
        <p>You need to sign in to view your progress.</p>
        <Link href="/login">Go to login</Link>
      </section>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { timezone: true }
  });
  const timeZone = user?.timezone || session.user.timezone || 'UTC';

  const sessions = await prisma.typingSession.findMany({
    where: { userId: session.user.id },
    orderBy: { timestamp: 'asc' }
  });

  const streaks = computeStreaks(sessions, timeZone);
  const recentKeys = buildRecentDayKeys(30, timeZone);
  const byDay = new Map();
  for (const row of sessions) {
    const key = dayKey(row.timestamp, timeZone);
    const prev = byDay.get(key) || { count: 0, wpmTotal: 0, accTotal: 0 };
    prev.count += 1;
    prev.wpmTotal += row.netWpm;
    prev.accTotal += row.accuracy;
    byDay.set(key, prev);
  }

  const sessionsPerDay = recentKeys.map((k) => byDay.get(k)?.count || 0);
  const avgWpmPerDay = recentKeys.map((k) => {
    const day = byDay.get(k);
    if (!day || day.count === 0) return 0;
    return Math.round((day.wpmTotal / day.count) * 10) / 10;
  });

  const totalSessions = sessions.length;
  const avgAccuracy = totalSessions === 0
    ? 0
    : Math.round((sessions.reduce((acc, x) => acc + x.accuracy, 0) / totalSessions) * 10) / 10;

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      <h1 style={{ margin: 0 }}>Progress Overview</h1>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <article style={cardStyle()}>
          <h2 style={{ marginTop: 0 }}>Current Streak</h2>
          <p style={{ fontSize: 36, margin: '0.25rem 0' }}>{streaks.current} days</p>
          <p style={{ color: '#475569' }}>Longest: {streaks.longest} days</p>
        </article>
        <article style={cardStyle()}>
          <h2 style={{ marginTop: 0 }}>Sessions</h2>
          <p style={{ fontSize: 36, margin: '0.25rem 0' }}>{totalSessions}</p>
          <p style={{ color: '#475569' }}>Total completed sessions</p>
        </article>
        <article style={cardStyle()}>
          <h2 style={{ marginTop: 0 }}>Average Accuracy</h2>
          <p style={{ fontSize: 36, margin: '0.25rem 0' }}>{avgAccuracy}%</p>
          <p style={{ color: '#475569' }}>Across all sessions</p>
        </article>
      </div>

      <article style={cardStyle()}>
        <h2 style={{ marginTop: 0 }}>Daily Sessions (30 days)</h2>
        <TinyLineChart values={sessionsPerDay} />
      </article>

      <article style={cardStyle()}>
        <h2 style={{ marginTop: 0 }}>Daily Average Net WPM (30 days)</h2>
        <TinyLineChart values={avgWpmPerDay} />
      </article>
    </div>
  );
}
