# Beacon

Beacon is a clean aggregator for links, posts, and discussion: public feeds (hot, new, top, plus tags), readable one-level comment threads, and an authenticated dashboard for posts, saved items, and notifications.

This file owns commands, folder layout, fonts, and agent workflow. The linked docs own their respective contracts. Read [ROADMAP prerequisite fixes](docs/ROADMAP.md#prerequisite-fixes-after-phase-0) before starting Phase 1; Phase 0 is merged and its history stays intact.

- [`docs/PRD.md`](docs/PRD.md). routes, schema, caching, and out-of-scope list
- [`docs/ROADMAP.md`](docs/ROADMAP.md). phases, workflow, and definition of done
- [`docs/glossary.md`](docs/glossary.md). domain terms
- [`docs/adr/`](docs/adr/). architecture decisions
- [`docs/design-rules.md`](docs/design-rules.md). layout constraints, viewport test widths, and animation standards

## Commands

- `bun dev`: Start the local development server.
- `bun run build`: Create the production build.
- `bun start`: Run the production server.
- `bun run check`: Ultracite check.
- `bun run fix`: Format with Oxfmt and autofix Oxlint warnings.
- `bun run doctor:scoped`: React Doctor on changed files.
- `bun run db:generate`: Generate Drizzle migration.
- `bun run db:migrate`: Run migrations.
- `bun run db:push`: Push schema directly, local only.
- `bun run db:studio`: Open Drizzle Studio.

Planned commands, added in [Phase 1](docs/ROADMAP.md#phase-1-public-pages-without-caching). They are not present in the completed Phase 0 package scripts yet.

- `bun run db:seed`: Seed the [PRD fixtures](docs/PRD.md#seed-contract-and-named-fixtures).
- `bun run test:e2e`: Run Playwright against the built app and real fixture database.

## Tech stack, end state

- Next.js 16.3 (App Router, cache components, partial prefetching as end state), React 19, TypeScript
- Tailwind CSS 4, shadcn/ui
- PostgreSQL on Neon, Drizzle ORM with `node-postgres` Pool
- Better Auth with username plugin
- TanStack Form is installed. TanStack Query and the root provider ship in [Phase 1](docs/ROADMAP.md#phase-1-public-pages-without-caching).
- Bun. Playwright and Markdown rendering dependencies ship in the same phase.
- Vercel hosting with Dockerfile kept ready for portable hosts

## Agent notes

- Package manager is **Bun**. Do not add an npm/yarn/pnpm lockfile.
- Follow the [PRD data-access contract](docs/PRD.md#1-technical-stack-end-state), including its handler exceptions and the [notification polling read](docs/PRD.md#7-dashboard-architecture-and-persistent-shell).
- Do not invent features. Check the [PRD out-of-scope list](docs/PRD.md#out-of-scope) before expanding scope.
- Before implementing a cached public route, record the [roadmap three-line spec](docs/ROADMAP.md#workflow-discipline).
- Use the exact scopes and real `cacheLife` profiles in the [PRD cache matrix](docs/PRD.md#6-route-caching-and-invalidation-matrix).
- Follow [PRD mutation refresh targets](docs/PRD.md#mutation-refresh-targets) and its session isolation rules when adding cached reads or actions.
- Product guards come from the [PRD lifecycle matrix](docs/PRD.md#lifecycle-matrix) and [shared transaction contract](docs/PRD.md#shared-transaction-and-lock-order). ADRs explain rationale rather than define a second rule list.
- Follow [roadmap testing decisions](docs/ROADMAP.md#testing-decisions), including the phase-aware [counter verification](docs/PRD.md#counter-verification).
- UI fonts: DM Sans (`font-heading`), Inter (`font-sans`), Geist Mono (`font-mono`).
- Use the [design color tokens](docs/design-rules.md#color-system-and-tokens) for styling.

## Feature-based architecture and code organization

- **Feature-first organization:** Domain-specific code lives encapsulated under `src/features/<feature>/` (for example, `src/features/auth/`).
- **Inside each feature:** Feature queries live in `queries.ts` with `server-only` for reads. Writes live in `actions.ts` as Server Actions. Components live in `components/`. Validation lives in `validations.ts`.
- **Shared code lives outside `features/`:**
  - `src/components/`: shared application components such as the [Crossfade wrapper](docs/design-rules.md#animation-and-transition-standards).
  - `src/components/ui/`: generic UI design system primitives (Base UI, shadcn).
  - `src/components/form/`: reusable TanStack Form composition primitives and context.
  - `src/hooks/`: cross-cutting application hooks (for example, `use-app-form.ts`).
  - `src/lib/`: infrastructure utilities, app-wide client/server auth configuration (`auth.ts`, `auth-client.ts`), and helpers.
  - `src/db/`: database schemas, migrations, and Drizzle clients.
  - `src/app/`: Next.js App Router entry points, kept thin as composition routes importing feature components.

## Layout and responsiveness

- Inspect the [design viewport matrix](docs/design-rules.md#viewport-testing-requirements) before completing UI layout work, including every named laptop width.
- Follow [design rules](docs/design-rules.md) for container boundaries, dashboard navigation, overflow, and motion.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Git workflow

- One issue per phase, one PR per issue. The two [prerequisite fixes](docs/ROADMAP.md#prerequisite-fixes-after-phase-0) each get their own issue and PR before Phase 1.
- Branch from `main` with `phase/<n>-<slug>`, for example `phase/4-votes-comments-saved`. Prerequisite fixes use `fix/<slug>` branches from `main`.
- Merge style is merge commit. Preserve phase history.
- PR must link its issue, list its exit checks from `docs/ROADMAP.md`, and call out any out of scope touches.

## Task verification checklist

Run this checklist before declaring any task complete or presenting code for review:

1. **Format and lint:** Run `bun run fix` to format with Oxfmt and autofix Oxlint warnings.
2. **Type check:** Run `bun x next typegen && bun x tsc --noEmit` to verify zero TypeScript errors.
3. **React diagnostics:** Run `bun run doctor:scoped` to audit modified components for performance, hydration, and architectural issues. Fix any reported error diagnostics.
4. **Production build:** Run `bun run build` to confirm the Next.js production build succeeds with no route or bundle failures.
5. **Responsive review:** If modifying UI layouts, inspect screens at 1280, 1366, 1440, and 1512 pixels per the [design viewport matrix](docs/design-rules.md#viewport-testing-requirements).
6. **No incomplete submissions:** Never mark a task complete or create a commit if any verification step fails.

Full code standards reference is [Ultracite code standards](.agents/skills/ultracite/references/code-standards.md).
