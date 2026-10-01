# Beacon

Beacon is a clean aggregator for links, posts, and discussion: public feeds (new / hot / top, plus tags), readable one-level comment threads, and an authenticated dashboard for posts, saved items, and notifications.

Product spec lives in `docs/`. Treat those files as source of truth over this one.

- [`docs/PRD.md`](docs/PRD.md) — routes, schema, caching, and out-of-scope list
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — phases, workflow, and definition of done
- [`docs/glossary.md`](docs/glossary.md) — domain terms
- [`docs/adr/`](docs/adr/) — architecture decisions
- [`docs/design-rules.md`](docs/design-rules.md) — layout constraints, viewport test widths, and animation standards

## Commands

- `bun dev`: Start the local development server.
- `bun run build`: Create the production build.
- `bun start`: Run the production server.

## Tech stack

- Next.js 16.3 (App Router, cache components, partial prefetching), React 19, TypeScript
- Tailwind CSS 4, shadcn/ui
- PostgreSQL, Drizzle ORM
- Better Auth
- TanStack Query, TanStack Form
- Playwright, Bun

## Agent notes

- Package manager is **Bun**. Do not add an npm/yarn/pnpm lockfile.
- There is **no application API or SDK layer**. Reads go through shared Drizzle query functions called from Server Components; writes go through Server Actions.
- **Do not invent features** that are not in the PRD (downvotes, deep comment trees, a REST/GraphQL API, extra auth providers, and so on). Check the out-of-scope list before expanding scope.
- Before implementing a cached public route, write the three-line spec from the roadmap: what is cached, which tag invalidates it, and what stays dynamic.
- Core invariants: one tag per post; comments nest at most one level; upvotes only (toggle off on second click); unpublish only when `commentCount` is 0; delete is hard when there are no comments and soft when there are (see ADR 0001).
- Automated tests are Playwright against user-visible behavior. Do not mock the database. Server Action rules are verified by hand unless a later phase says otherwise.
- UI fonts: DM Sans (`font-heading`), Inter (`font-sans`), Geist Mono (`font-mono`).
- Brand accent is Orange, mapped to shadcn semantic tokens (`bg-primary`, `text-primary`). Do not hardcode black buttons or custom hex values.

## Feature-based architecture and code organization

- **Feature-first organization:** Domain-specific code lives encapsulated under `src/features/<feature>/` (for example, `src/features/auth/`).
- **Inside each feature:** Group feature-scoped components (`components/`), validation schemas (`validations.ts`), and feature-specific hooks or utilities.
- **Shared code lives outside `features/`:**
  - `src/components/ui/`: generic UI design system primitives (Base UI, shadcn).
  - `src/components/form/`: reusable TanStack Form composition primitives and context.
  - `src/hooks/`: cross-cutting application hooks (for example, `use-app-form.ts`).
  - `src/lib/`: infrastructure utilities, app-wide client/server auth configuration (`auth.ts`, `auth-client.ts`), and helpers.
  - `src/db/`: database schemas, migrations, and Drizzle clients.
  - `src/app/`: Next.js App Router entry points, kept thin as composition routes importing feature components.

## Layout and responsiveness

- Test responsive layouts at widths of 1280, 1366, 1440, and 1512 pixels before marking any UI task complete.
- Main page boundaries cap at `max-w-5xl` with horizontal padding. The public feed uses a single focused column, and the dashboard shell uses an in-page sidebar layout.
- For complete layout rules, overflow constraints, and animation boundaries, consult `docs/design-rules.md`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Task verification checklist

Run this checklist before declaring any task complete or presenting code for review:

1. **Format and lint:** Run `bun run fix` to format with Oxfmt and autofix Oxlint warnings.
2. **Type check:** Run `bun x tsc --noEmit` to verify zero TypeScript errors.
3. **React diagnostics:** Run `bunx react-doctor@latest --scope changed` to audit modified components for performance, hydration, and architectural issues. Fix any reported error diagnostics.
4. **Production build:** Run `bun run build` to confirm the Next.js production build succeeds with no route or bundle failures.
5. **Responsive review:** If modifying UI layouts, inspect screens at 1280, 1366, 1440, and 1512 pixels per `docs/design-rules.md`.
6. **No incomplete submissions:** Never mark a task complete or create a commit if any verification step fails.

Full code standards reference: `.agents/skills/ultracite/references/code-standards.md`.
