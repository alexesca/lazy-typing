import { normalizeTextForMode } from '../core/normalize.js';
import { pickOne } from '../core/random.js';
import { QUOTES, TECHNICAL, WORD_LIST, JS_SNIPPETS } from './textData.js';

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function makeParagraph(pool, rng, sentenceCount = 5, targetWords = 300) {
  let text = '';
  while (wordCount(text) < targetWords) {
    const sentences = [];
    for (let i = 0; i < sentenceCount; i += 1) {
      sentences.push(pickOne(pool, rng));
    }
    text = `${text} ${sentences.join(' ')}`.trim();
  }
  return text;
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
    const raw = makeParagraph(pool, rng, params.sentenceCount || 5, params.targetWords || 300);
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
    const targetWords = params.targetWords || 300;
    while (words.length < targetWords) {
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
