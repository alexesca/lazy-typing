# Repository Guidelines

## Project Structure & Module Organization
This repository is an Nx-style monorepo with npm workspaces:

- `apps/cli/` for the npm-published `typing-trainer` CLI app.
- `apps/dashboard/` for the Next.js dashboard (Auth.js, history, logs, graphs).
- `packages/core/` for shared typing-domain logic.
- `scripts/` for helper tooling.

CLI internals:

- `apps/cli/src/cli/` command parsing and interactive runtime.
- `apps/cli/src/core/` terminal UI, history, sync/auth/config.
- `apps/cli/src/sources/` built-in text sources.
- `apps/cli/src/plugins/` plugin loader and plugin examples.
- `apps/cli/tests/` Node test runner unit tests.

Dashboard internals:

- `apps/dashboard/app/` Next.js app router pages and API routes.
- `apps/dashboard/lib/` auth/db/sync utility modules.
- `apps/dashboard/prisma/` Prisma schema.
- `apps/dashboard/k8s/` Kubernetes manifests (Gateway API deployment).

## Build, Test, and Development Commands
Use these commands from repo root:

- `npm run start` — run the CLI app.
- `npm run test` — run CLI tests.
- `npm run dev:dashboard` — start the Next.js dashboard in dev mode.
- `npm run nx -- <target>` — run Nx targets manually.
- `kubectl apply -k apps/dashboard/k8s` — apply dashboard Kubernetes manifests.

Package-specific commands:

- `npm run start --workspace=@lazyclis/typing-trainer`
- `npm run test --workspace=@lazyclis/typing-trainer`
- `npm run dev --workspace=@lazy-typing/dashboard`

## Coding Style & Naming Conventions
No formatter/linter is enforced yet. Follow:

- Indentation: 2 spaces for JS/TS/JSON, 4 spaces for Python.
- File naming: `kebab-case` for directories, `camelCase` or `kebab-case` for JS files.
- Keep modules small and use descriptive names.
- Prefer explicit data contracts for CLI sync payloads and dashboard API routes.

## Testing Guidelines
Current framework: Node.js built-in test runner.

- Test files: `apps/cli/tests/*.test.js`
- Run: `npm run test --workspace=@lazyclis/typing-trainer`

When adding dashboard tests, place them under `apps/dashboard` and document the command here.

## Commit & Pull Request Guidelines
- Use imperative, present-tense commit subjects (example: `Add CLI device-code login flow`).
- Keep commit subjects under 72 characters when possible.

For pull requests include:

- Short summary of changes.
- Testing notes (`what ran` or `not run`).
- Screenshots for dashboard/UI changes.

## Security & Configuration Tips
- Never commit secrets.
- Keep dashboard environment variables in `apps/dashboard/.env` and commit only `apps/dashboard/.env.example`.
- Required dashboard variables: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.
