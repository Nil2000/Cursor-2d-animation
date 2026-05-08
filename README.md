# Cursor 2D Animations

A full-stack app for creating and rendering 2D animation videos from chat-driven prompts.

## Architecture

### High-level flow

1. User sends a prompt from the browser UI.
2. `main-app` validates/authenticates, persists chat/video records in Postgres, then enqueues a render job in Redis.
3. `processor` consumes the queue job, runs rendering (Manim via Docker), and uploads output to S3-compatible storage.
4. `main-app` exposes status endpoints that the client polls to show progress and final video URL.

### Services

- `main-app/`: Next.js 15 application (UI + API routes + auth + DB access).
- `processor/`: Bun worker service that consumes Redis jobs and executes render pipeline.
- `notify-server/` (deployment target): companion backend process for notification/workflow support.

### Data and infrastructure

- Database: Postgres (recommended: Neon).
- Queue: Redis.
- Object storage: Cloudflare R2 or any S3-compatible provider.
- Hosting:
  - `main-app`: Vercel.
  - `processor` and `notify-server`: VPS (recommended: DigitalOcean).

## Repository layout

- `main-app/` - Next.js app.
- `processor/` - queue consumer/render worker.
- `notify-server/` - notification backend service.

There is no root `package.json`. Run package commands inside the package directory you are working on.

## Tech stack

- Frontend/API: Next.js 15 + TypeScript
- Auth: Better Auth
- ORM/DB access: Drizzle ORM + Postgres
- Worker runtime: Bun
- Queue/message layer: Redis
- Rendering runtime: Dockerized Manim
- Storage: S3-compatible object storage

## Local development

### Prerequisites

- [Bun](https://bun.sh/)
- Docker
- Postgres database
- Redis instance
- S3-compatible bucket (or local alternative)

### Install

```bash
cd main-app && bun install
cd ../processor && bun install
```

### Run services

In separate terminals:

```bash
cd main-app && bun run dev
```

```bash
cd processor && bun run start
```

If used in your setup, run `notify-server` with its configured start command.

## Environment configuration

Set environment variables per service. Typical production variables include:

- `main-app`:
  - `NEXT_PUBLIC_BASE_URL`
  - `DATABASE_URL`
  - `BETTER_AUTH_SECRET`
  - OAuth credentials (for enabled providers)
  - model/API keys (for enabled providers)
  - `REDIS_URL`
  - `REDIS_QUEUE_NAME`
  - `INTERNAL_API_KEY`

- `processor` / `notify-server`:
  - `REDIS_PASSWORD` (when self-hosting Redis with auth)
  - `API_URL`
  - `INTERNAL_API_KEY`
  - `REDIS_URL` (for example: `redis://:your-password@host:6379`)
  - `REDIS_QUEUE_NAME`
  - `S3_ACCESS_KEY`
  - `S3_SECRET_KEY`
  - `S3_BUCKET`
  - `S3_ENDPOINT`
  - `S3_PORT`
  - `S3_SSL`
  - optional `S3_PUBLIC_CUSTOM_DOMAIN`

Keep secrets out of version control. Use hosting platform secret managers.

## Deployment overview

Recommended production split:

- Deploy `main-app` to Vercel.
- Deploy `processor` and `notify-server` on a VPS.
- Use managed Postgres and managed Redis where possible.
- Store rendered assets in S3-compatible object storage.

See `DEPLOYMENT_PLAN.md` for full rollout phases, checklist, and launch order.

## Reliability and security notes

- Prefer authenticated/internal access for status and internal APIs.
- Add request rate limiting for generation endpoints.
- Ensure queue operations fail loudly (avoid silent enqueue failures).
- Add idempotency strategy for queue jobs to prevent duplicate processing.
- Keep Redis non-public unless strictly required, and lock down network access.

## Helpful docs

- `DEPLOYMENT_PLAN.md` - production deployment phases and checklist.
- `IMPROVEMENT_FINDINGS.md` - pending hardening and quality improvements.
- `AGENTS.md` - contributor/agent workflow and project conventions.
