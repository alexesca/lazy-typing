import { getPendingHistory, markHistoryFailed, markHistorySynced } from './history.js';
import { uploadSessionsBatch } from './api.js';

export async function syncPendingSessions({ baseUrl, accessToken, limit = 200 }) {
  const pending = await getPendingHistory(limit);
  if (pending.length === 0) {
    return { uploaded: 0, synced: 0, failed: 0, pending: 0 };
  }

  const payload = pending.map((item) => ({
    sessionId: item.sessionId,
    timestamp: item.timestamp,
    completedAt: item.completedAt,
    mode: item.mode,
    sourceId: item.sourceId,
    setId: item.setId,
    sessionType: item.sessionType,
    netWpm: item.netWpm,
    grossWpm: item.grossWpm,
    accuracy: item.accuracy,
    rawErrors: item.rawErrors,
    finalErrors: item.finalErrors,
    elapsedMs: item.elapsedMs,
    consistency: item.consistency,
    client: item.client,
    metadata: item.metadata
  }));

  try {
    const result = await uploadSessionsBatch({ baseUrl, accessToken, sessions: payload });
    const okIds = new Set((result.results || [])
      .filter((r) => r.status === 'ok' || r.status === 'duplicate')
      .map((r) => r.sessionId));

    const syncedIds = pending
      .filter((item) => okIds.size === 0 || okIds.has(item.sessionId))
      .map((item) => item.sessionId);

    const failedIds = pending
      .filter((item) => !syncedIds.includes(item.sessionId))
      .map((item) => item.sessionId);

    await markHistorySynced(syncedIds);
    if (failedIds.length > 0) {
      await markHistoryFailed(failedIds, 'Server rejected session(s)');
    }

    return {
      uploaded: payload.length,
      synced: syncedIds.length,
      failed: failedIds.length,
      pending: Math.max(0, pending.length - syncedIds.length)
    };
  } catch (error) {
    const allIds = pending.map((item) => item.sessionId);
    await markHistoryFailed(allIds, error?.message || 'sync failed');
    throw error;
  }
}
