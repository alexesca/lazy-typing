# Repository Guidelines

## Project Structure & Module Organization
This repository is currently empty aside from `.git`. As code is added, keep a predictable layout:

- `src/` for application/library code.
- `tests/` for automated tests.
- `scripts/` for helper tooling.
- `assets/` for static files (images, fixtures, data).

If you choose a different structure, update this document with the actual paths.

## Build, Test, and Development Commands
No build, test, or runtime tooling is configured yet. When you add them, document the exact commands here, for example:

- `npm run dev` — start the local dev server.
- `npm test` — run the unit test suite.
- `make build` — produce a production build.

Keep the list short and scoped to the commands contributors must run.

## Coding Style & Naming Conventions
No formatting or linting tools are defined. Until a tool is adopted, follow these defaults:

- Indentation: 2 spaces for JS/TS/JSON, 4 spaces for Python.
- File naming: `kebab-case` for directories, `PascalCase` for class files when relevant.
- Keep functions small and prefer descriptive names over abbreviations.

Once a formatter or linter is added (e.g., Prettier, ESLint, Black, Ruff), note the version and primary config file path.

## Testing Guidelines
Testing framework not selected yet. When added, include:

- The framework name and version (e.g., Jest, Pytest).
- Test file naming (e.g., `*.test.ts`, `test_*.py`).
- How to run tests (single command).

Aim for tests that cover core logic and critical edge cases.

## Commit & Pull Request Guidelines
This repository has no commit history yet, so no established commit message style exists. Until conventions are set:

- Use imperative, present-tense subjects (e.g., "Add CLI entrypoint").
- Keep messages under 72 characters when possible.

For pull requests, include:

- A short summary of changes.
- Testing notes (what you ran, or "not run").
- Screenshots for UI changes, if applicable.

## Security & Configuration Tips
Avoid committing secrets. If you add configuration files:

- Provide sample templates (e.g., `.env.example`).
- Document required environment variables and defaults.
