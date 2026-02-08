# Lazy Typing Monorepo

Monorepo for an offline-first typing trainer ecosystem:

- `apps/cli`: npm-published terminal app (`typing-trainer`)
- `apps/dashboard`: Next.js dashboard with Auth.js, history, logs, graphs, and streaks
- `packages/core`: shared typing-domain logic

## Workspace Commands

```bash
npm run start
npm run test
npm run dev:dashboard
```

## CLI Overview

The CLI is offline by default and always stores local history first. If logged in, it can sync pending sessions to the dashboard.

```bash
typing-trainer login --base-url http://localhost:3000
typing-trainer status
typing-trainer sync
typing-trainer logout
```

## Dashboard Overview

The dashboard provides:

- Auth.js login
- Session history and logs
- Progress graphs (daily sessions and net WPM)
- Daily streak tracking by user timezone

## Notes

- Run Prisma migrations for `apps/dashboard/prisma/schema.prisma` before using dashboard APIs.
- Current credential auth is intentionally simple for local development and should be hardened before production.
