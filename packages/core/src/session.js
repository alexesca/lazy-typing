import crypto from 'node:crypto';

export function createSessionRecord(input) {
  return {
    sessionId: input.sessionId || crypto.randomUUID(),
    timestamp: Number(input.timestamp) || Date.now(),
    completedAt: input.completedAt || new Date(Number(input.timestamp) || Date.now()).toISOString(),
    mode: input.mode || 'words',
    sourceId: input.sourceId || 'unknown',
    setId: input.setId,
    sessionType: input.sessionType || 'timed',
    netWpm: Number(input.netWpm) || 0,
    grossWpm: Number(input.grossWpm) || 0,
    accuracy: Number(input.accuracy) || 0,
    rawErrors: Number(input.rawErrors) || 0,
    finalErrors: Number(input.finalErrors) || 0,
    elapsedMs: Number(input.elapsedMs) || 0,
    consistency: input.consistency == null ? undefined : Number(input.consistency),
    client: input.client || 'cli',
    metadata: {
      strict: Boolean(input?.metadata?.strict),
      platform: input?.metadata?.platform || process.platform,
      version: input?.metadata?.version || '0.1.0'
    }
  };
}

export function validateSessionRecord(record) {
  return Boolean(
    record
      && typeof record.sessionId === 'string'
      && typeof record.mode === 'string'
      && typeof record.sourceId === 'string'
      && Number.isFinite(record.timestamp)
      && Number.isFinite(record.netWpm)
      && Number.isFinite(record.grossWpm)
      && Number.isFinite(record.accuracy)
      && Number.isFinite(record.elapsedMs)
  );
}
