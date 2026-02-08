import { patchConfig, readConfig } from './config.js';

function normalizeSyncConfig(sync, baseUrlFallback) {
  return {
    enabled: Boolean(sync?.enabled),
    autoSync: Boolean(sync?.autoSync),
    baseUrl: sync?.baseUrl || baseUrlFallback || '',
    accountId: sync?.accountId,
    accessToken: sync?.accessToken,
    refreshToken: sync?.refreshToken,
    expiresAt: sync?.expiresAt
  };
}

export async function getAuthState(baseUrlFallback) {
  const config = await readConfig();
  return normalizeSyncConfig(config.sync, baseUrlFallback);
}

export async function saveAuthState(statePatch) {
  return patchConfig((current) => {
    const currentSync = normalizeSyncConfig(current.sync);
    return {
      ...current,
      sync: {
        ...currentSync,
        ...statePatch,
        enabled: true
      }
    };
  });
}

export async function clearAuthState() {
  return patchConfig((current) => ({
    ...current,
    sync: {
      ...(current.sync || {}),
      enabled: false,
      accountId: undefined,
      accessToken: undefined,
      refreshToken: undefined,
      expiresAt: undefined
    }
  }));
}

export function hasValidAccessToken(auth) {
  if (!auth?.accessToken) return false;
  if (!auth?.expiresAt) return true;
  return Number(auth.expiresAt) > Date.now();
}
