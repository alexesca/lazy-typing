import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeTextForMode } from '../core/normalize.js';

const DATA_PATH = fileURLToPath(new URL('../../assets/data/book-of-mormon.json', import.meta.url));
let cached;

function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function capWords(text, maxWords) {
  return text.trim().split(/\s+/).filter(Boolean).slice(0, maxWords).join(' ');
}

function sortRows(a, b) {
  const bookA = Number(a.book_id) || 0;
  const bookB = Number(b.book_id) || 0;
  if (bookA !== bookB) return bookA - bookB;
  const chapterA = Number(a.chapter_number) || 0;
  const chapterB = Number(b.chapter_number) || 0;
  if (chapterA !== chapterB) return chapterA - chapterB;
  const verseA = Number(a.verse_number) || 0;
  const verseB = Number(b.verse_number) || 0;
  return verseA - verseB;
}

async function loadCorpus() {
  if (cached) return cached;

  cached = (async () => {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    const rows = (Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.rows) ? parsed.rows : []))
      .filter((r) => r && typeof r.scripture_text === 'string' && typeof r.book_title === 'string')
      .map((r) => ({
        book_title: r.book_title,
        book_short_title: r.book_short_title,
        book_id: r.book_id,
        chapter_number: r.chapter_number,
        verse_number: r.verse_number,
        scripture_text: r.scripture_text.trim()
      }))
      .filter((r) => r.scripture_text.length > 0)
      .sort(sortRows);

    const byBook = new Map();
    for (const row of rows) {
      const bookId = slugify(row.book_title);
      if (!byBook.has(bookId)) {
        byBook.set(bookId, {
          id: bookId,
          name: row.book_title,
          rows: []
        });
      }
      byBook.get(bookId).rows.push(row);
    }

    const books = Array.from(byBook.values());
    return { rows, books, byBook };
  })();

  return cached;
}

function buildPassage(rows, rng, targetWords) {
  if (rows.length === 0) {
    return { text: 'No scripture rows available.', meta: {} };
  }

  const start = Math.floor((rng?.() ?? Math.random()) * rows.length);
  const selected = [];
  let words = 0;

  for (let offset = 0; offset < rows.length; offset += 1) {
    const row = rows[(start + offset) % rows.length];
    const rowWords = wordCount(row.scripture_text);
    selected.push(row);
    words += rowWords;
    if (words >= targetWords) break;
  }

  const text = capWords(selected.map((r) => r.scripture_text).join(' '), targetWords);
  return {
    text,
    meta: {
      book: selected[0]?.book_title,
      chapterStart: selected[0]?.chapter_number,
      verseStart: selected[0]?.verse_number,
      chapterEnd: selected[selected.length - 1]?.chapter_number,
      verseEnd: selected[selected.length - 1]?.verse_number
    }
  };
}

const BOOK_OF_MORMON_SOURCE = {
  id: 'book-of-mormon',
  name: 'Book of Mormon Corpus',
  supportedModes: ['words', 'punctuation'],
  async listSets() {
    try {
      const { books } = await loadCorpus();
      return [
        { id: 'all', name: 'All Books' },
        ...books.map((book) => ({ id: book.id, name: book.name }))
      ];
    } catch {
      return [{ id: 'all', name: 'All Books' }];
    }
  },
  async getText(params) {
    const targetWords = Math.max(40, Math.min(300, Number(params.targetWords) || 300));

    try {
      const corpus = await loadCorpus();
      let rows = corpus.rows;
      if (params.setId && params.setId !== 'all') {
        rows = corpus.byBook.get(params.setId)?.rows || [];
      } else if (corpus.books.length > 0) {
        const pick = corpus.books[Math.floor((params.rng?.() ?? Math.random()) * corpus.books.length)];
        rows = pick.rows;
      }

      const passage = buildPassage(rows, params.rng, targetWords);
      return {
        text: normalizeTextForMode(passage.text, params.mode, { allowNumbers: false }),
        meta: passage.meta
      };
    } catch {
      return {
        text: 'Book of Mormon source unavailable. Ensure assets/data/book-of-mormon.json exists.',
        meta: { error: true }
      };
    }
  }
};

export default BOOK_OF_MORMON_SOURCE;
