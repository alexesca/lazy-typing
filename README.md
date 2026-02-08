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

## Dashboard Kubernetes (Gateway API)

This repository uses Gateway API resources for production routing instead of Ingress.

1. Build and push the dashboard image:

```bash
docker build -f apps/dashboard/Dockerfile -t ghcr.io/alexesca/lazy-typing-dashboard:latest .
docker push ghcr.io/alexesca/lazy-typing-dashboard:latest
```

2. Create production secrets (do not commit real values):

```bash
cp apps/dashboard/k8s/secret.example.yaml /tmp/dashboard-secret.yaml
# edit /tmp/dashboard-secret.yaml with real DATABASE_URL and NEXTAUTH_SECRET
kubectl apply -f /tmp/dashboard-secret.yaml
```

3. Apply manifests:

```bash
kubectl apply -k apps/dashboard/k8s
```

4. Customize these placeholders before production use:
- `apps/dashboard/k8s/gateway.yaml`: `gatewayClassName` and `hostname`
- `apps/dashboard/k8s/configmap.yaml`: `NEXTAUTH_URL`
- `apps/dashboard/k8s/deployment.yaml`: container image tag

5. cert-manager:
- The `Gateway` resource includes `cert-manager.io/cluster-issuer: letsencrypt-prod`.
- Replace with your issuer name or remove it if your platform manages TLS differently.

## Dashboard Local Development

Local development stays unchanged and does not require Kubernetes:

```bash
npm run dev:dashboard
```

Optional Node debugging:

```bash
NODE_OPTIONS='--inspect=0.0.0.0:9229' npm run dev --workspace=@lazy-typing/dashboard
```
