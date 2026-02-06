#!/usr/bin/env node
import process from 'node:process';
import { run } from './run.js';
import { parseArgs, printHelp } from './parseArgs.js';
import { listAvailableSources, listSetsForSource } from '../plugins/loader.js';
import { historyPath, readHistory } from '../core/history.js';

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
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
    console.log(`History file: ${historyPath()}`);
    if (history.length === 0) {
      console.log('No history yet.');
      return;
    }
    for (const r of history.slice().reverse()) {
      const stamp = new Date(r.timestamp).toISOString();
      console.log(`${stamp} | mode=${r.mode} | source=${r.sourceId} | net=${r.netWpm.toFixed(1)} | gross=${r.grossWpm.toFixed(1)} | acc=${r.accuracy.toFixed(1)}% | errors=${r.finalErrors}`);
    }
    return;
  }

  await run(args);
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exitCode = 1;
});
