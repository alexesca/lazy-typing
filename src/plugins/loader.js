import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import builtins from '../sources/index.js';
import { readConfig } from '../core/config.js';

const USER_PLUGIN_DIR = path.join(process.env.TYPING_TRAINER_HOME || path.join(os.homedir(), '.typing-trainer'), 'plugins');

function validatePlugin(plugin) {
  return plugin
    && typeof plugin.id === 'string'
    && typeof plugin.name === 'string'
    && Array.isArray(plugin.supportedModes)
    && typeof plugin.getText === 'function';
}

async function loadUserPlugins() {
  const plugins = [];
  try {
    const files = await fs.readdir(USER_PLUGIN_DIR);
    const jsFiles = files.filter((f) => f.endsWith('.js') || f.endsWith('.mjs'));
    for (const file of jsFiles) {
      const full = path.join(USER_PLUGIN_DIR, file);
      try {
        const mod = await import(pathToFileURL(full).href);
        const plugin = mod.default || mod;
        if (validatePlugin(plugin)) {
          plugins.push(plugin);
        }
      } catch {
        // Ignore invalid plugin files.
      }
    }
  } catch {
    // Ignore missing plugin directory.
  }
  return plugins;
}

export async function loadAllSources() {
  const config = await readConfig();
  const user = await loadUserPlugins();
  const all = [...builtins, ...user];
  if (Array.isArray(config.enabledSources) && config.enabledSources.length > 0) {
    const enabled = new Set(config.enabledSources);
    return all.filter((s) => enabled.has(s.id));
  }
  return all;
}

export async function listAvailableSources() {
  return loadAllSources();
}

export async function resolveSource(sourceId) {
  const all = await loadAllSources();
  return all.find((s) => s.id === sourceId) || null;
}

export async function listSetsForSource(sourceId) {
  const source = await resolveSource(sourceId);
  if (!source) return null;
  if (typeof source.listSets !== 'function') return [];
  return source.listSets();
}

export function userPluginDir() {
  return USER_PLUGIN_DIR;
}
