# Roadmap: Beacon

This document defines the implementation phases, workflow discipline, and definition of done for Beacon.

## Implementation phases

### Phase 0: Scaffolding

- Initialize Next.js 16.3 application.
- Configure Ultracite with Oxlint and Oxfmt, Husky pre-commit hooks, and React Doctor CLI and oxlint plugin rules enabled.
- Add CI running Ultracite, a typecheck, the build, and React Doctor.
- Install shadcn/ui base components.
- Add environment variable schema.
- Set up Drizzle ORM schema for `users` and Better Auth tables, where `sessions` and `accounts` reference `users.id` with cascade delete. Domain tables are added in subsequent phases.
- Run initial database migrations against Neon Postgres.
- Configure Better Auth with username required at registration.

**Exit criteria:** Users can register, sign in, and view database tables via Drizzle Studio. Continuous integration passes on pull requests.

### Phase 1: Public pages without caching

- Set up Drizzle ORM schema for `posts` with required title, required tag, optional link, optional header image, optional body, and `authorId` referencing `users.id` with set null on delete. Set up `comments` referencing `posts.id` and `users.id` with cascade delete.
- Run database migrations for `posts` and `comments`.
- Build `/`, `/t/[tag]`, `/tags`, `/p/[id]`, and `/u/[username]` using plain server-side data fetching.
- Keep `cacheComponents` and `'use cache'` turned off.
- Implement feed card interaction: link post title and domain pill open destination in a new tab; remaining card surface navigates to `/p/[id]`; text post card navigates to `/p/[id]`.
- Create a database seed script to populate test users, posts (title-only discussions, link posts, text posts with body, and posts with header images), tags, and comments.

**Exit criteria:** Every public route renders real data correctly.

### Phase 2: Cache components adoption

- Turn on `cacheComponents: true` in `next.config.ts`.
- Apply `'use cache'`, `cacheTag`, and `cacheLife` to feeds, tags, post body, and author profile reads per the matrix in `docs/PRD.md`.
- Resolve any build warnings or dynamic execution errors reported by Next.js.

**Exit criteria:** `next build` passes with `cacheComponents` enabled, and development mode shows no Instant Insights errors on public routes.

### Phase 3: Partial prefetching

- Turn on `partialPrefetching: true` in `next.config.ts`.
- Add `<Link prefetch={true}>` to feed links pointing to `/p/[id]`.
- Use the Navigation Inspector to verify route shells render before streaming sections resolve.

**Exit criteria:** Clicking a feed link renders the post header and shell immediately, while comments stream in after navigation.

### Phase 4: Voting, comments, and saved posts

- Set up Drizzle ORM schema for `votes` and `saved_posts`, referencing target entities and `users.id` with cascade delete.
- Run database migrations for `votes` and `saved_posts`.
- Implement the vote Server Action with transactional score updates, author karma updates, and exact cache tag invalidations.
- Apply `useOptimistic` to the vote button.
- Implement comment submission, enforcing the single-level nesting constraint in the Server Action.
- Mount comments in an isolated Suspense boundary wrapped with a `<Crossfade>` component.
- Implement the private saved post toggle Server Action with optimistic user interface feedback.

**Exit criteria:** Voting and bookmarking update immediately on click, and page refreshes confirm data persistence and tag invalidation.

### Phase 5: Dashboard shell

- Build the `/dashboard/*` layout with a persistent client provider.
- Implement post management at `/dashboard/posts`: listing, drafting, publishing, unpublishing, and deletion.
- Build post submission and edit forms using TanStack Form, validating required `title` and `tag` while keeping `url`, `headerImageUrl`, and `body` optional.
- Enforce lifecycle rules: allow unpublishing only with zero comments; hard delete when `commentCount` is zero; soft delete when comments exist, setting `deletedAt`, nulling `authorId`, clearing `headerImageUrl`, and replacing `body` with the fixed removal message; reject votes, comments, and edits on a soft-deleted post.
- Build `/dashboard/saved` with tag filtering.
- Set `export const instant = false` on `/dashboard/posts/[id]/edit` to enforce deliberate blocking navigation.

**Exit criteria:** Navigating across dashboard sub-routes preserves the sidebar and notification badge without re-fetching or re-rendering.

### Phase 6: Notifications

- Set up Drizzle ORM schema for `notifications`, referencing `users.id` and the source comment with cascade delete.
- Run database migrations for `notifications`.
- Build `getNotifications` and `markNotificationRead` as Server Actions; no separate API layer.
- Implement Server Component preloading with `HydrationBoundary`, calling `getNotifications` directly.
- Configure TanStack Query client polling on a 10 to 15 second interval, using `getNotifications` as the `queryFn` and `markNotificationRead` as `useMutation`'s `mutationFn`.
- Trigger notification inserts inside comment and reply Server Actions.

**Exit criteria:** Leaving a comment on another author's post generates a notification visible in their dashboard within one polling interval.

### Phase 7: View transitions

- Add crossfade transitions to post and comment reveals.
- Add reflow transitions to the feed when score changes alter post ranking.
- Add directional transitions between `/dashboard/posts` and `/dashboard/posts/[id]/edit`.

**Exit criteria:** Transitions render smoothly under network throttling without conflicting with Suspense boundaries.

### Phase 8: Automated tests and audit

- Write Playwright tests verifying instant navigation transitions: feed to post, feed to author profile, and dashboard posts to edit form.
- Audit the codebase against the out-of-scope list in `docs/PRD.md`, including confirming no API or SDK layer exists.
- Validate the cache invalidation matrix against Server Action source code tag by tag.
- Verify soft-delete behavior end to end: fixed removal message, cleared header image, nulled author, frozen votes and comments.

**Exit criteria:** All Playwright navigation tests pass, no out-of-scope features exist in the codebase, and all cache tags are verified.

## Workflow discipline

Before prompting an agent to implement any feature, write a three-line specification:

1. What is cached.
2. What tag invalidates it.
3. What remains dynamic.

This practice prevents accidental dynamic bailouts and prevents serving stale cached content.

During specific phases, refer to relevant reference guides:

- Use cache component reference patterns for Phase 2.
- Use partial prefetching reference patterns for Phase 3.
- Use React View Transitions patterns for Phase 7.

Review agent pull requests and diffs specifically for scope creep against the three-line spec.

Before building the Phase 5 dashboard layout, write down exactly what state must persist across navigation. If left unspecified, agents often refetch data per route, breaking the persistent shell design.

## Testing decisions

### Testing philosophy

Tests must evaluate external behavior and user-visible side effects rather than internal implementation details or private methods. Tests should avoid mocking the database, preferring to assert against real state changes and rendered output.

### Automated: browser integration seam

Playwright tests execute end-to-end user journeys against a running application instance, using the `instant()` test helper from `@next/playwright`. These tests verify:

- Instant navigation transitions between feed, post detail, and author profile routes.
- Partial prefetching behavior by asserting that route shells render before streaming sections resolve.
- Dashboard persistence by asserting that layout state and notification badges do not unmount or reload during navigation.

This is the project's only automated test seam. It confirms a route renders instantly; it does not confirm the underlying data is correct.

### Manual: Server Action verification

No automated suite covers Server Action business logic. Verify these rules by hand at the point they're implemented, and again after any later change that touches them:

- Reply-to-a-reply is rejected (Phase 4).
- Voting twice on the same target removes the vote (Phase 4).
- Unpublishing a post with `commentCount` greater than zero is rejected (Phase 5).
- Deleting a post with comments produces the exact soft-delete state: fixed removal message, cleared header image, nulled author, frozen votes and comments (Phase 5).

## Definition of done

A build is complete only when all criteria are met:

1. All three Playwright instant navigation tests pass in continuous integration and local environments.
2. The out-of-scope list in `docs/PRD.md` contains no half-implemented features.
3. Every route in `docs/PRD.md` has its caching, streaming, or blocking behavior verified against the running application.
