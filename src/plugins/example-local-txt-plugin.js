import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_DIR = process.env.TYPING_TRAINER_TEXT_DIR || path.join(process.cwd(), 'assets', 'texts');

async function readTxtFiles() {
  let names = [];
  try {
    names = (await fs.readdir(BASE_DIR)).filter((n) => n.endsWith('.txt'));
  } catch {
    return [];
  }
  const items = [];
  for (const name of names) {
    const content = await fs.readFile(path.join(BASE_DIR, name), 'utf8');
    if (content.trim()) items.push({ name, content: content.trim() });
  }
  return items;
}

export default {
  id: 'local-txt',
  name: 'Local TXT Files',
  supportedModes: ['words', 'punctuation', 'dev'],
  async listSets() {
    return [{ id: 'default', name: 'All text files' }];
  },
  async getText() {
    const files = await readTxtFiles();
    if (files.length === 0) {
      return { text: 'Add .txt files to assets/texts to use the local-txt plugin.' };
    }
    const pick = files[Math.floor(Math.random() * files.length)];
    return { text: pick.content, meta: { file: pick.name } };
  }
};
