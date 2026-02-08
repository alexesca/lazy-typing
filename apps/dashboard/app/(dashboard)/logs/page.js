import { auth } from '../../../lib/auth.js';
import { prisma } from '../../../lib/prisma.js';

export default async function LogsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return <p>Please sign in.</p>;
  }

  const deviceCodes = await prisma.cliDeviceCode.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
  const tokens = await prisma.cliToken.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <section style={{ display: 'grid', gap: '1.5rem' }}>
      <h1>Auth and Sync Logs</h1>

      <article>
        <h2>Recent Device Authorizations</h2>
        <ul>
          {deviceCodes.map((d) => (
            <li key={d.id}>
              {d.userCode} | {d.status} | {new Date(d.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </article>

      <article>
        <h2>Active CLI Tokens</h2>
        <ul>
          {tokens.map((t) => (
            <li key={t.id}>
              {t.name || 'cli token'} | expires {new Date(t.expiresAt).toLocaleDateString()} | last used {t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleString() : 'never'}
            </li>
          ))}
        </ul>
      </article>
    </section>
  );
}
