function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) throw new Error('Missing dashboard URL. Set sync.baseUrl in config or use --base-url.');
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
}

async function expectJson(res) {
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text || 'Invalid JSON response' };
  }
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export async function startDeviceAuth({ baseUrl, deviceName }) {
  const url = `${normalizeBaseUrl(baseUrl)}/api/cli/device/start`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ deviceName: deviceName || 'typing-trainer-cli' })
  });
  return expectJson(res);
}

export async function pollDeviceToken({ baseUrl, deviceCode }) {
  const url = `${normalizeBaseUrl(baseUrl)}/api/cli/device/token`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ deviceCode })
  });
  return expectJson(res);
}

export async function uploadSessionsBatch({ baseUrl, accessToken, sessions }) {
  const url = `${normalizeBaseUrl(baseUrl)}/api/cli/sessions/batch`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({ sessions })
  });
  return expectJson(res);
}
