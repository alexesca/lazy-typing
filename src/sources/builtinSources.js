import { normalizeTextForMode } from '../core/normalize.js';
import { pickOne } from '../core/random.js';
import { QUOTES, TECHNICAL, WORD_LIST, JS_SNIPPETS } from './textData.js';

function makeParagraph(pool, rng, sentenceCount = 5, targetChars = 600) {
  const chunks = [];
  while (chunks.join(' ').length < targetChars) {
    const sentences = [];
    for (let i = 0; i < sentenceCount; i += 1) {
      sentences.push(pickOne(pool, rng));
    }
    chunks.push(sentences.join(' '));
  }
  return chunks.join(' ');
}

const QUOTE_SOURCE = {
  id: 'quotes',
  name: 'Built-in Quotes',
  supportedModes: ['words', 'punctuation'],
  async listSets() {
    return [
      { id: 'general', name: 'General Quotes' },
      { id: 'technical', name: 'Technical Prose' }
    ];
  },
  async getText(params) {
    const rng = params.rng;
    const set = params.setId || 'general';
    const pool = set === 'technical' ? TECHNICAL : QUOTES;
    const raw = makeParagraph(pool, rng, params.sentenceCount || 5, params.targetChars || 600);
    return {
      text: normalizeTextForMode(raw, params.mode, { allowNumbers: false }),
      meta: { set }
    };
  }
};

const WORD_SOURCE = {
  id: 'wordlist',
  name: 'Built-in Word List',
  supportedModes: ['words'],
  async getText(params) {
    const words = [];
    const targetChars = params.targetChars || 600;
    while (words.join(' ').length < targetChars) {
      words.push(pickOne(WORD_LIST, params.rng));
    }
    return { text: normalizeTextForMode(words.join(' '), 'words') };
  }
};

const JS_SOURCE = {
  id: 'js-snippets',
  name: 'Built-in JavaScript Snippets',
  supportedModes: ['dev'],
  async getText(params) {
    const raw = pickOne(JS_SNIPPETS, params.rng);
    const text = normalizeTextForMode(raw, 'dev', { strict: Boolean(params.strict) });
    return { text };
  }
};

export default [QUOTE_SOURCE, WORD_SOURCE, JS_SOURCE];
