import { normalizeTextForMode } from '../core/normalize.js';
import { pickOne } from '../core/random.js';
import { QUOTES, TECHNICAL, WORD_LIST, JS_SNIPPETS } from './textData.js';
import bookOfMormonSource from './bookOfMormonSource.js';

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
    const raw = pickOne(pool, rng);
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
    for (let i = 0; i < 35; i += 1) {
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

export default [QUOTE_SOURCE, WORD_SOURCE, JS_SOURCE, bookOfMormonSource];
