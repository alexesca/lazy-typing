# Typing Trainer (CLI)

Terminal typing practice with a Typing.com + Monkeytype feel.

## Features

- Minimal terminal UI with live correctness highlighting
- Modes: `words`, `punctuation`, `dev`
- Session styles:
  - Timed test (`--time`, default `60` seconds)
  - Text completion (finish text before timer)
- Stats: net WPM, gross WPM, accuracy, errors, elapsed/remaining time, progress
- Built-in text sources + pluggable source interface
- Result history in SQLite (`~/.typing-trainer/history.db`) with JSON fallback

## Install / Run

```bash
npm install
npm start
```

Or run as a CLI bin:

```bash
npm link
typing-trainer
```

## Usage

```bash
typing-trainer \
  --mode words|punctuation|dev \
  --time 15|30|60|120|<seconds> \
  --source <sourceId> \
  --set <setId> \
  --strict \
  --session timed|completion \
  --seed <number>
```

Other commands:

```bash
typing-trainer --list-sources
typing-trainer --list-sets book-of-mormon
typing-trainer --list-sets quotes
typing-trainer --history
typing-trainer --help
```

## Controls

- `Esc`: pause menu (resume/restart/cycle mode/quit)
- `Tab`: quick restart
- `Ctrl+R`: restart
- `Ctrl+N`: next text
- `F1` or `?`: help overlay
- `Ctrl+C`: quit

## Config

Config file: `~/.typing-trainer/config.json`

Example:

```json
{
  "defaultMode": "words",
  "defaultSource": "quotes",
  "defaultSession": "timed",
  "enabledSources": ["quotes", "wordlist", "js-snippets"],
  "seed": 123
}
```

Plugin directory: `~/.typing-trainer/plugins`

History storage:

- Primary: `~/.typing-trainer/history.db` (SQLite)
- Fallback: `~/.typing-trainer/history.json`

## Text Source Plugin Contract

A plugin exports an object with:

- `id: string`
- `name: string`
- `supportedModes: ("words"|"punctuation"|"dev")[]`
- `listSets?: () => Promise<Array<{id: string, name: string}>>`
- `getText: (params) => Promise<{text: string, meta?: any}>`
- `warmup?: () => Promise<void>`

`params` includes: `mode`, `setId`, `strict`, `rng`.

Optional config keys: `defaultMode`, `defaultSource`, `defaultSession`, `seed`, `enabledSources`.

Built-in source: `book-of-mormon`
- Data file path: `assets/data/book-of-mormon.json`
- Sets: `all` and one per book title

## Example Plugin

See: `src/plugins/example-local-txt-plugin.js`

To use it as a user plugin:

1. Copy it to `~/.typing-trainer/plugins/local-txt.mjs`
2. Add `.txt` files under `assets/texts` (or set `TYPING_TRAINER_TEXT_DIR`)
3. Run `typing-trainer --source local-txt`

## Project Structure

- `src/core`: session/stats/normalization/rendering/history/config
- `src/sources`: built-in text source library
- `src/plugins`: plugin loading + example plugin
- `src/cli`: CLI parsing and interactive runtime
- `tests`: unit tests for stats, normalization, and loader

## Testing

```bash
npm test
```
