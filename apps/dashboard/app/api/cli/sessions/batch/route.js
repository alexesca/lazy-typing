import { NextResponse } from 'next/server';
import { userIdFromBearer } from '../../../../../lib/cliAuth.js';
import { prisma } from '../../../../../lib/prisma.js';

function normalizeSession(input) {
  return {
    sessionId: String(input.sessionId || ''),
    timestamp: Number(input.timestamp),
    completedAt: input.completedAt ? new Date(input.completedAt) : new Date(Number(input.timestamp) || Date.now()),
    mode: String(input.mode || 'words'),
    sourceId: String(input.sourceId || 'unknown'),
    setId: input.setId ? String(input.setId) : null,
    sessionType: String(input.sessionType || 'timed'),
    netWpm: Number(input.netWpm || 0),
    grossWpm: Number(input.grossWpm || 0),
    accuracy: Number(input.accuracy || 0),
    rawErrors: Number(input.rawErrors || 0),
    finalErrors: Number(input.finalErrors || 0),
    elapsedMs: Number(input.elapsedMs || 0),
    consistency: input.consistency == null ? null : Number(input.consistency),
    client: String(input.client || 'cli'),
    metadata: input.metadata && typeof input.metadata === 'object' ? input.metadata : {}
  };
}

function valid(s) {
  return Boolean(
    s.sessionId
      && Number.isFinite(s.timestamp)
      && Number.isFinite(s.netWpm)
      && Number.isFinite(s.grossWpm)
      && Number.isFinite(s.accuracy)
      && Number.isFinite(s.elapsedMs)
  );
}

export async function POST(req) {
  const userId = await userIdFromBearer(req.headers.get('authorization'));
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const sessions = Array.isArray(body.sessions) ? body.sessions : [];
  if (sessions.length === 0) {
    return NextResponse.json({ error: 'No sessions in payload' }, { status: 400 });
  }

  const results = [];
  for (const raw of sessions) {
    const session = normalizeSession(raw);
    if (!valid(session)) {
      results.push({ sessionId: session.sessionId || null, status: 'invalid' });
      continue;
    }

    try {
      await prisma.typingSession.create({
        data: {
          userId,
          sessionId: session.sessionId,
          timestamp: session.timestamp,
          completedAt: session.completedAt,
          mode: session.mode,
          sourceId: session.sourceId,
          setId: session.setId,
          sessionType: session.sessionType,
          netWpm: session.netWpm,
          grossWpm: session.grossWpm,
          accuracy: session.accuracy,
          rawErrors: session.rawErrors,
          finalErrors: session.finalErrors,
          elapsedMs: session.elapsedMs,
          consistency: session.consistency,
          client: session.client,
          metadata: session.metadata
        }
      });
      results.push({ sessionId: session.sessionId, status: 'ok' });
    } catch {
      const existing = await prisma.typingSession.findUnique({
        where: { userId_sessionId: { userId, sessionId: session.sessionId } }
      });
      if (existing) {
        results.push({ sessionId: session.sessionId, status: 'duplicate' });
      } else {
        results.push({ sessionId: session.sessionId, status: 'error' });
      }
    }
  }

  return NextResponse.json({ results });
}
