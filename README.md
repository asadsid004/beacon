# Beacon

Beacon is a link and text post discussion platform built with Next.js and PostgreSQL. It has public feeds for links and discussions, alongside an authenticated author dashboard to manage posts, bookmarks, and notifications.

## Features

- Public feeds sorted by new, hot, or top, with tag filters and a tag directory.
- Link posts and text posts with optional Markdown body and external header images.
- Discussion threads with single-level nested comment replies.
- Upvotes for posts and comments, with author karma totals.
- Author dashboard for post lifecycle operations: draft, edit, publish, unpublish, and soft delete.
- In-app notifications for comments and replies with background polling.
- Private saved posts with tag filters.

## Tech stack

- Next.js 16.3 with App Router, cache components, and partial prefetching
- React 19
- TypeScript
- PostgreSQL with Drizzle ORM
- Better Auth
- Tailwind CSS 4
- TanStack Query and TanStack Form
- Playwright for end-to-end tests
- Bun for package management and script execution

## Core architectural rules

- **Data access.** All queries and mutations run through a shared Drizzle data-access module. Server Components call query functions directly for reads, and Server Actions execute writes. The application has no separate API layer.
- **Comment depth.** Comments allow one level of nesting. Users can reply to a top-level comment. Replies to replies are rejected.
- **Post lifecycle.** Authors can unpublish a post only when it has zero comments. Deleting a post with zero comments removes the row from the database. Deleting a post with comments triggers a soft delete. The server clears the author and header image, replaces the body with a fixed notice, and keeps the title, URL, tag, score, and comment tree intact.
- **Voting.** Upvotes increment post score and author karma. A second click on an active upvote removes the vote. Downvotes do not exist.
- **Caching.** Public routes use Next.js cache components with explicit cache tags. Server Actions invalidate these tags on data mutation.

## Getting started

### Prerequisites

- [Bun](https://bun.sh) (v1.2.8 or later)
- PostgreSQL database (such as Neon, Supabase, Railway, or local Docker)

### Setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Configure environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Provide the required values in `.env.local`:
   - `DATABASE_URL`: PostgreSQL connection string.
   - `BETTER_AUTH_SECRET`: Random 32+ character string for token signing.
   - `BETTER_AUTH_URL`: Application URL (e.g. `http://localhost:3000`).

3. (Optional) Start local PostgreSQL with Docker:

   ```bash
   docker compose up -d
   ```

4. Start the development server: Start the development server:
   ```bash
   bun dev
   ```

## Available scripts

- `bun dev`: Starts the local development server.
- `bun run build`: Builds the application for production.
- `bun run start`: Runs the built production server.
- `bun run check`: Checks formatting with Oxfmt and runs Oxlint.
- `bun run fix`: Automatically formats code and fixes lint issues.
- `bun run doctor`: Runs React Doctor component diagnostic audit.

## Project structure

```text
beacon/
├── docs/
│   ├── PRD.md          # Product requirements and route specifications
│   ├── ROADMAP.md      # Implementation phases and verification steps
│   ├── glossary.md     # Domain terminology
│   └── adr/            # Architecture decision records
├── public/             # Static assets
└── src/
    └── app/            # App Router routes, layouts, and styles
```

## Documentation

- [Product requirements document](docs/PRD.md): Complete specifications, route matrix, schema definitions, and caching rules.
- [Implementation roadmap](docs/ROADMAP.md): Phases, workflow discipline, and verification criteria.
- [Domain glossary](docs/glossary.md): Definitions for domain models and business terms.
- [Architecture decision records](docs/adr/): Recorded technical decisions.
