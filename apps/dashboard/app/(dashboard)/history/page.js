import { auth } from '../../../lib/auth.js';
import { prisma } from '../../../lib/prisma.js';

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <p>Please sign in.</p>;
  }

  const rows = await prisma.typingSession.findMany({
    where: { userId: session.user.id },
    orderBy: { timestamp: 'desc' },
    take: 200
  });

  return (
    <section>
      <h1>Session History</h1>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">Time</th>
              <th align="left">Mode</th>
              <th align="left">Source</th>
              <th align="right">Net WPM</th>
              <th align="right">Accuracy</th>
              <th align="right">Errors</th>
              <th align="left">Client</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid #cbd5e1' }}>
                <td>{new Date(r.timestamp).toLocaleString()}</td>
                <td>{r.mode}</td>
                <td>{r.sourceId}</td>
                <td align="right">{r.netWpm.toFixed(1)}</td>
                <td align="right">{r.accuracy.toFixed(1)}%</td>
                <td align="right">{r.finalErrors}</td>
                <td>{r.client}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
