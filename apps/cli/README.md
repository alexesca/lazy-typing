# Typing Trainer CLI

Offline-first terminal typing trainer with optional dashboard sync.

## Run locally

```bash
npm install
npm run start --workspace=@lazyclis/typing-trainer
```

## Test

```bash
npm run test --workspace=@lazyclis/typing-trainer
```

## Sync commands

```bash
typing-trainer login --base-url http://localhost:3000
typing-trainer status
typing-trainer sync
typing-trainer logout
```
