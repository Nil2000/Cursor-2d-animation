# Agent Guidelines

Guidelines for AI agents working on this repository.

## Repository layout

- **`main-app/`** — Next.js 15 app (UI, API routes, Drizzle ORM, auth). Run package commands from this directory.
- **`processor/`** — Bun service that consumes the Redis queue and runs video/render jobs. Run its scripts from this directory.

There is **no root `package.json`**; always `cd` into the package you are changing before installing or running scripts.

## Package manager

- **Use [Bun](https://bun.sh/)** for Node-related work in this repo.

| Task | Command |
|------|---------|
| Install dependencies | `bun install` |
| Add dependency | `bun add <package>` |
| Add dev dependency | `bun add -d <package>` |
| Run scripts | `bun run <script>` (e.g. `bun run dev`, `bun run lint`) |

The **processor** is intended to run with Bun (`bun run src/index.ts` via its `start` script).

## UI (main-app)

- Prefer **shadcn/ui** primitives when building or changing UI. Existing components live under `main-app/components/ui/`.
- Add missing components with:

  ```bash
  cd main-app && bunx shadcn@latest add <component-name>
  ```

- See [shadcn/ui docs](https://ui.shadcn.com/docs/components) for component names and usage.

## Codebase pointers (main-app)

- **API routes:** `main-app/app/api/`
- **DB schema & migrations:** `main-app/lib/schema.ts`, Drizzle config alongside `main-app/`
- **Auth:** `main-app/lib/auth.ts` and Better Auth usage in routes

When touching credits, queues, or chat/video flows, read the relevant route and schema together; behavior spans the app API and sometimes the processor.

## General practices

- Match existing patterns (imports, naming, file layout) and keep changes **scoped** to the task—avoid drive-by refactors or unrelated files.
- Preserve **TypeScript** types; do not loosen types to silence errors without a clear reason.
- For UI work, respect **light and dark** themes if the surrounding screen already supports them.
- Prefer **relative same-origin** fetches from the browser (`/api/...`) unless the codebase already uses an env base URL for a documented reason.
