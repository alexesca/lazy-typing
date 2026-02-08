#!/usr/bin/env node
import process from 'node:process';
import { run } from './run.js';
import { parseArgs, printHelp } from './parseArgs.js';
import { listAvailableSources, listSetsForSource } from '../plugins/loader.js';
import { fallbackHistoryPath, historyPath, pendingHistoryCount, readHistory } from '../core/history.js';
import { clearAuthState, getAuthState, hasValidAccessToken, saveAuthState } from '../core/auth.js';
import { pollDeviceToken, startDeviceAuth } from '../core/api.js';
import { syncPendingSessions } from '../core/sync.js';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runLogin(baseUrlArg) {
  const auth = await getAuthState(baseUrlArg);
  const baseUrl = baseUrlArg || auth.baseUrl;
  if (!baseUrl) {
    throw new Error('Missing dashboard base URL. Run: typing-trainer login --base-url http://localhost:3000');
  }

  const started = await startDeviceAuth({ baseUrl, deviceName: `typing-trainer-cli-${process.platform}` });
  const expiresAt = Date.now() + (Number(started.expiresIn) || 600) * 1000;

  console.log(`Open this URL and enter code:\n${started.verificationUri}\n\nCode: ${started.userCode}`);

  const intervalMs = Math.max(1, Number(started.intervalSec) || 5) * 1000;
  while (Date.now() < expiresAt) {
    await sleep(intervalMs);
    try {
      const token = await pollDeviceToken({ baseUrl, deviceCode: started.deviceCode });
      if (token.status === 'pending') {
        continue;
      }
      if (token.status === 'approved' && token.accessToken) {
        await saveAuthState({
          baseUrl,
          accountId: token.accountId,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          expiresAt: token.expiresAt,
          autoSync: true,
          enabled: true
        });
        console.log('Login successful. CLI sync is enabled.');
        return;
      }
      if (token.status === 'expired') {
        break;
      }
    } catch {
      // keep polling until timeout
    }
  }

  throw new Error('Device login expired before authorization completed.');
}

async function runStatus(baseUrlArg) {
  const auth = await getAuthState(baseUrlArg);
  const pending = await pendingHistoryCount();
  console.log(`Dashboard URL: ${auth.baseUrl || '(not set)'}`);
  console.log(`Logged in: ${hasValidAccessToken(auth) ? 'yes' : 'no'}`);
  if (auth.accountId) {
    console.log(`Account: ${auth.accountId}`);
  }
  console.log(`Auto sync: ${auth.autoSync ? 'enabled' : 'disabled'}`);
  console.log(`Pending local sessions: ${pending}`);
}

async function runSync(baseUrlArg) {
  const auth = await getAuthState(baseUrlArg);
  const baseUrl = baseUrlArg || auth.baseUrl;
  if (!baseUrl) {
    throw new Error('Missing dashboard URL. Run: typing-trainer sync --base-url http://localhost:3000');
  }
  if (!hasValidAccessToken(auth)) {
    throw new Error('Not logged in or token expired. Run: typing-trainer login');
  }

  const result = await syncPendingSessions({ baseUrl, accessToken: auth.accessToken });
  console.log(`Uploaded: ${result.uploaded}, synced: ${result.synced}, failed: ${result.failed}, pending: ${result.pending}`);
}

async function handleCommand(args) {
  if (args.command === 'login') {
    await runLogin(args.baseUrl);
    return true;
  }
  if (args.command === 'logout') {
    await clearAuthState();
    console.log('Logged out. Local sessions remain stored offline.');
    return true;
  }
  if (args.command === 'status') {
    await runStatus(args.baseUrl);
    return true;
  }
  if (args.command === 'sync') {
    await runSync(args.baseUrl);
    return true;
  }
  return false;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (await handleCommand(args)) {
    return;
  }

  if (args.listSources) {
    const sources = await listAvailableSources();
    for (const s of sources) {
      console.log(`${s.id}\t${s.name}\t[${s.supportedModes.join(', ')}]`);
    }
    return;
  }

  if (args.listSetsFor) {
    const sets = await listSetsForSource(args.listSetsFor);
    if (!sets) {
      console.error(`Unknown source: ${args.listSetsFor}`);
      process.exitCode = 1;
      return;
    }
    if (sets.length === 0) {
      console.log(`No sets for source ${args.listSetsFor}`);
      return;
    }
    for (const set of sets) {
      console.log(`${set.id}\t${set.name}`);
    }
    return;
  }

  if (args.showHistory) {
    const history = await readHistory();
    console.log(`SQLite DB (optional): ${historyPath()}`);
    console.log(`History JSON (default): ${fallbackHistoryPath()}`);
    if (history.length === 0) {
      console.log('No history yet.');
      return;
    }
    for (const r of history.slice().reverse()) {
      const stamp = new Date(r.timestamp).toISOString();
      console.log(`${stamp} | mode=${r.mode} | source=${r.sourceId} | net=${r.netWpm.toFixed(1)} | gross=${r.grossWpm.toFixed(1)} | acc=${r.accuracy.toFixed(1)}% | errors=${r.finalErrors} | sync=${r.syncState}`);
    }
    return;
  }

  await run(args);
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exitCode = 1;
});
