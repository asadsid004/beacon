# Roadmap: Beacon

This file owns build order and exit checks. [PRD](PRD.md) owns product rules, [glossary](glossary.md) owns definitions, [design rules](design-rules.md) own layout and motion, and [AGENTS](../AGENTS.md) owns commands and workflow.

## Implementation phases

### Phase 0: scaffolding

Done and merged. Next.js app, Ultracite, Husky, CI, shadcn base, environment schema, Drizzle auth tables, Neon migrations, and Better Auth with username signup are implemented. Do not rewrite Phase 0 history. The current code lacks the corrections listed below; those are new issues and PRs.

### Prerequisite fixes after Phase 0

Complete and merge these two small fix PRs before branching Phase 1. Each gets its own issue and uses a new migration or code change, never an amendment to Phase 0.

1. Schema fix. Convert existing auth timestamps and make karma non-null per [PRD section 2](PRD.md#2-data-architecture-and-schema-contracts). Preserve the original migration. Verify the new migration on a database containing existing timestamp values and null karma, confirm UTC instants survive conversion, confirm karma becomes zero, and verify signup/signin still work.
2. Auth fix. Implement reserved-name validation per [PRD section 1](PRD.md#1-technical-stack-end-state), plus return-path and signed-in auth-page behavior per [PRD section 5](PRD.md#5-route-map). Check existing usernames for reserved-name conflicts and report any affected account before enforcement; do not silently rename accounts. Verify both email and username login. Verify a dashboard path with a query survives login, an external or non-dashboard return target falls back, and signed-in login/signup visits redirect. Check mixed-case reserved signup attempts at both form and server boundaries.

All task verification commands in [AGENTS](../AGENTS.md#task-verification-checklist) must pass for each fix PR. Existing reserved-name conflicts block that fix until resolved explicitly. The docs task creates neither PR nor implementation.

### Phase 1: public pages without caching

- Add the `posts` and `comments` migration, including constraints and indexes from [PRD section 2](PRD.md#2-data-architecture-and-schema-contracts).
- Install runtime packages `@tanstack/react-query` and `react-markdown`. Install dev packages `@playwright/test` and `@next/playwright`; the Playwright runner supplies the underlying `playwright` dependency. Add the test command and planned `db:seed` command in [AGENTS](../AGENTS.md#commands). Use Bun only.
- Mount a client `QueryClientProvider` at the root, with one stable browser QueryClient. It has no notification consumer yet. Root placement follows [PRD section 7](PRD.md#7-dashboard-architecture-and-persistent-shell).
- Build `/`, `/t/[tag]`, `/tags`, `/p/[id]`, and `/u/[username]` with plain server fetching. Keep `cacheComponents`, `partialPrefetching`, and `use cache` off. Use `connection()` outside the plain read boundary to make these database reads request-time work rather than static build snapshots.
- Build the static root navbar and Suspense user slot according to [design rules](design-rules.md#universal-top-navigation-bar). Signed-in feature controls appear only when their destination/action ships.
- Build cards, body rendering, image fallback, sorting, pagination, and dates from [PRD section 4](PRD.md#4-feed-card-and-form-rules). Explicit stretched-link prefetch works in Phase 1 production; Phase 3 changes its model.
- Give detail body and thread separate Suspense boundaries and skeletons now. Keep thread reads out of the body await chain. Phase 4 adds interactive controls, not the first comments boundary.
- Add errors, not-found, loading, and empty states from [PRD section 5](PRD.md#5-route-map).
- Implement the [seed contract and named fixtures](PRD.md#seed-contract-and-named-fixtures), including synthetic scores and fixture karma for this phase.
- Set up local and CI Postgres, migrations, seed, browser installation, production server startup, and Playwright in the order specified in [CI setup](#ci-setup-from-phase-1).
- Add Playwright feed-to-detail and feed-to-profile tests using `title-only` and `alice`.

Exit checks:

- Every public route renders its named fixtures, and production build passes with both flags off.
- L1 and L2. `draft-private` is absent from feeds/profile/tag counts and its direct detail is 404. `deleted-thread` is absent from public lists but its detail preserves the placeholder and thread. A malformed UUID, `unknown-fixture-tag`, and `unknown-fixture-user` produce not-found UI without a 500.
- Ordering. Home new/top show `tie-a` before `tie-b`; `/t/ties` verifies the same order for hot. Evaluate the PRD formula against the fixture timestamps and database current time, then compare the `ranking` hot order. At the reference instant its scores match the worked example; later elapsed time changes values. Top puts `rank-old-high` before `rank-fresh`. Profile history follows the PRD order.
- Pagination. The seeded home feed has 20, 20, and 5 posts on pages 1, 2, and 3; page 4 is 404. Page 1 canonicalization preserves sort, and invalid/below-one page inputs show the first page. `charlie` shows the empty profile state.
- Links. `link-external` title/pill open the expected new tab with the specified rel attributes; comments/card background reach detail; author reaches profile. `title-only` reaches detail through its stretched title link. Keyboard focus and accessible names work.
- Tags. Seed `/tags` counts match a database aggregate restricted by L1, including the `lifecycle` tag. Unknown/empty tags do not appear.
- Media and text. `header-valid` reserves its image aspect ratio; `header-broken` shows its same-size fallback. `text-body` renders Markdown without raw HTML or images. `thread-post` renders plain-text comments in order, with 20 top level comments on page 1, one on page 2, and not-found UI on page 3. Check `reply-last` through the [comment hint](PRD.md#thread-navigation), including overriding a stale page parameter; Previous/Next clear the hint.
- Dates and karma. For the CI run, set the seed reference instant once to the current UTC time immediately before seeding and record it in the manifest. Verify `date-relative` and `date-absolute` on opposite sides of the PRD cutoff, plus `bob`'s nonzero derived fixture karma. Compute expected relative text from the real server-clock interval around the request, allowing only the unit boundary that interval crosses. Do not assume a browser clock freeze controls server rendering or Postgres time. For manual repeats, reuse the manifest/reference input to reproduce fixtures and account for elapsed time, or reseed with a new recorded instant for current relative-date checks.
- Public-page Playwright tests pass locally and in CI. Counter SQL is not a pass criterion before Phase 4.
- Responsive inspection passes the [design viewport matrix](design-rules.md#viewport-testing-requirements).

### Phase 2: cache components adoption

- Enable `cacheComponents: true`, leaving partial prefetching off.
- Replace plain request-time reads with the exact cached scopes and lifetimes in [PRD section 6](PRD.md#6-route-caching-and-invalidation-matrix). Remove Phase 1 `connection()` calls from cached public reads. Keep them out of cached helper call stacks.
- Tag the detail query's null sentinel before lookup. Keep `notFound()` in its caller. Never cache draft content.
- Add dynamic visitor islands with neutral defaults, without vote logic yet. Keep session access outside cached scopes.
- Reuse the Phase 1 CI service, migration, and seed setup. Resolve cache build warnings and dynamic bailouts.

Exit. Build passes with Cache Components. Recheck L1/L2 and all Phase 1 public rendering, sort, and pagination checks after cached-read changes. Verify the matrix's hot versus new/top scopes and that no parent cache masks hot expiration. Resolve Cache Components blocking-route insights at this adoption stage; partial-prefetch shell validation is Phase 3 work.

### Phase 3: partial prefetching

- Enable `partialPrefetching: true`.
- Preserve explicit prefetch on stretched feed links. Move URL parameter reads behind Suspense as required by the bundled adoption guide.
- Add the `instant()` Playwright check from `@next/playwright` for prefetched detail content, using `thread-post`.

Exit. After prefetch, the detail header renders immediately on click. Under a controlled cold, slow comments read, the header/shell appears while the comments skeleton remains, then the thread resolves. Cached comments are allowed to arrive immediately in normal navigation. Test against the production server; use a test-harness transaction holding an `ACCESS EXCLUSIVE` lock on the comments table before the cold prefetch to delay the real read, then release it after asserting the header and skeleton. Always release the lock in cleanup, and isolate this test from parallel writers. Do not mock the database or add a product delay endpoint. Restart the test server to clear its in-memory cache for this cold-cache case. Recheck L2 and card-link/pagination behavior after shell restructuring. Dev navigation has no unresolved instant-navigation insights on public routes.

### Phase 4: voting, comments, and saved posts

- Add `votes` and `saved_posts` and their constraints from [PRD section 2](PRD.md#2-data-architecture-and-schema-contracts).
- Reseed with actual votes and SQL-derived counters under the [Phase 4 seed contract](PRD.md#seed-contract-and-named-fixtures).
- Implement L9 to L17 and L20 using the [shared transaction contract](PRD.md#shared-transaction-and-lock-order). Add the prescribed rate limits and [mutation refresh targets](PRD.md#mutation-refresh-targets).
- Add vote, comment/reply, and saved-state controls. Keep existing comments Suspense boundaries. Use optimistic feedback only as specified in [PRD section 7](PRD.md#7-dashboard-architecture-and-persistent-shell).
- Add Playwright feed-vote and comment-submit tests that persist after refresh. The full saved-list route ships in Phase 5b; save/unsave on detail works here.

Exit. Verify L9 to L17 and L20 against `thread-post`, `rank-zero`, and `deleted-thread`. Use `alice` and `bob` to check self-vote rejection, toggle off, reply-parent rejection, private saves, and frozen deleted controls. Over-limit calls return readable errors. Vote/comment Playwright tests pass. Both counter queries return zero rows on the complete fixture. Recheck L1/L2 and hot/top ordering after live scores change. Save/unsave returns committed state after island refresh.

### Phase 5a: dashboard shell

- Build the dashboard layout per [design rules](design-rules.md#dashboard-layout), using the root provider installed in Phase 1.
- Keep sidebar and navbar mounted across route changes. Feature destinations are filled in their owning phases. The bell and notification query arrive in Phase 6.
- Verify persistence per [PRD section 7](PRD.md#7-dashboard-architecture-and-persistent-shell). Completed votes/saves persist in the database; pending optimistic mutations must not depend on a route-local component surviving unmount.
- Add Playwright dashboard-shell persistence coverage.

Exit. The sidebar and navbar stay mounted across built dashboard routes with no remount in React DevTools or layout shift. Recheck L20 gating and detail vote/save state across navigation. Repeat the badge/query persistence check after Phase 6 introduces those consumers.

### Phase 5b: post crud and lifecycle

- Build dashboard listing, new/edit forms with TanStack Form, saved list, and email-only settings, following [PRD route map](PRD.md#5-route-map).
- Add `export const instant = false` when creating `/dashboard/posts/[id]/edit` in this phase.
- Implement L3 to L8 and L18/L20 using the transaction contract and mutation refresh matrix. Do not copy field transformation or visibility rules here.

Exit checks:

- Complete L1 to L18 and L20 of the [lifecycle matrix](PRD.md#lifecycle-matrix) manually, with seed reset between scenarios. Counter SQL remains clean after vote operations. L19 notification checks begin in Phase 6.
- Use `lifecycle-draft` for L3/L5/L18. Observe `/tags` lifecycle count increase from two to three after publish, then return to two after permitted unpublish. Direct detail must recover from its previously cached draft miss after publish.
- Use `lifecycle-clean` for the hard-delete path in L7. Observe `/tags` lifecycle count decrease from two to one and detail become not-found.
- Use `lifecycle-thread` for the soft-delete path in L7/L8. Observe `/tags` lifecycle count decrease from two to one while detail preserves its thread. Check the matrix's exact retained/replaced fields and frozen actions.
- For L4, inspect the form and directly invoke the edit Server Action with changed title, URL, and tag on a published fixture. Expect server rejection and unchanged database fields. Body/image edits must succeed. The action check is required even when inputs are hidden.
- Race comment creation versus delete on `lifecycle-clean`, and vote versus unpublish/delete on a reset fixture. Verify the committed result follows lock ordering, with no orphan row or counter drift.
- Save `lifecycle-clean` as `bob`, verify tag filtering in saved reads, then unpublish/delete as `alice` and verify L15 removes it. Unsave refreshes the dynamic list. Draft save/delete appears on the dashboard's next render without public invalidation.
- Settings update refreshes email display while username stays locked. Recheck L20.

### Phase 6: notifications

- Add `notifications` per [PRD section 2](PRD.md#2-data-architecture-and-schema-contracts).
- Implement notification reads, mark-read, hydration, root bell, and polling according to [PRD section 7](PRD.md#7-dashboard-architecture-and-persistent-shell).
- Extend comment/reply transactions with L19 notification fanout.

Exit. With `alice` and `bob` on `thread-post`, L19 recipients and no-self-notify behavior pass. Bell/list converge within one polling interval; mark-read clears the count after refresh; links reach the source comment anchor on its resolved page. Check `reply-last` on page 2 and repeat after a score change moves its parent to another page. Implement link resolution through the [PRD thread navigation contract](PRD.md#thread-navigation), not a stored page number. Add Playwright or a timed manual check. Recheck L12/L13/L19/L20 and counter SQL because comment transactions changed. Repeat Phase 5a shell/badge persistence, background pause, and account-change query cleanup checks.

### Phase 7: view transitions

- Implement the [design motion contract](design-rules.md#animation-and-transition-standards), including `src/components/crossfade.tsx`.
- Add the specified feed reflow and dashboard content transitions. No Crossfade is introduced earlier.

Exit. Under throttled network, reveals and reorder meet the design contract; dashboard content transitions keep sidebar and badge still. Reduced-motion behavior passes. Recheck L2/L4/L9/L12 and shell persistence because their presentation/interaction boundaries changed.

### Phase 8: automated tests, full seo, and audit

- Audit the tests already written in their owning phases. Required Playwright coverage is feed-to-detail, feed-to-profile, prefetched header before cold comments, feed vote persists, comment persists, and dashboard shell persists.
- Add route metadata, canonical sort/page URLs, robots, and sitemap. Audit [PRD out of scope](PRD.md#out-of-scope).
- Validate every cache tag and dynamic/client refresh in the [mutation matrix](PRD.md#mutation-refresh-targets) against source.
- Recheck all L1 to L20 and named Phase 1 fixtures, including known not-found, sorting, pagination, media, and tag-count checks.
- Finish the portable Dockerfile and infrastructure health route if they have not shipped, then redeploy production. Verify hosting, environment, and preview database wiring against [PRD section 1](PRD.md#1-technical-stack-end-state). [ADR 0004](adr/0004-deploy-and-cache-topology.md) records the rationale.

Exit. All required tests pass locally and in CI. Every matrix refresh matches source, all lifecycle rows pass, scope audit passes, and production deployment is green.

## CI setup from Phase 1

Use a Postgres 17 service container locally and in CI with a health check. CI uses an isolated fixture database and UTC timezone. It does not connect to production Neon. Configure `DATABASE_URL`, a test-only Better Auth secret, and `BETTER_AUTH_URL` matching the production test server, normally `http://localhost:3000`. Capture one current UTC `SEED_REFERENCE_TIME` before seeding and retain it in the run manifest, as specified in the [seed contract](PRD.md#seed-contract-and-named-fixtures). Reusing that value reproduces the fixture timestamps exactly.

Run CI in this order:

1. Install with `bun install --frozen-lockfile` and install Playwright Chromium plus its Linux system dependencies.
2. Wait for Postgres health, then run migrations with `bun run db:migrate` and seed with `bun run db:seed`.
3. Run check, typegen/typecheck, scoped React Doctor, and production build using the [AGENTS verification commands](../AGENTS.md#task-verification-checklist). Builds may query the fixture database.
4. Start the built app with `bun start`, wait for readiness, and run `bun run test:e2e` against that server. Playwright retains traces on failure.
5. Stop the server and database/test transactions during cleanup.

The same migrate, seed, build, start, and test order applies locally. Playwright and its browser setup ship in Phase 1, rather than waiting for Phase 2. `@next/playwright` ships with the runner setup and its `instant()` helper first appears in Phase 3 timing coverage.

## Workflow discipline

Before implementing a cached route, record three lines in its issue or PR:

1. What is cached.
2. Which matrix tag invalidates it with `updateTag`.
3. What stays dynamic in islands.

Review changes against that scope. Before Phase 5a, identify shared state owners according to [PRD section 7](PRD.md#7-dashboard-architecture-and-persistent-shell). Reverify the relevant lifecycle rows after later changes: reads/cache L1/L2/L15, votes L9/L10/L11/L17/L20, comments L12/L13/L19/L20, post management L3 to L8/L18/L20, saves L14 to L16/L20, notification writes L19/L20. Presentation changes repeat the affected rows' visible checks.

## Testing decisions

Automated tests assert external behavior and rendered effects against the real fixture database. Use `instant()` only where navigation timing matters. Test against a production server because prefetching behavior differs from development.

Server Action rules use manual checks and the [counter SQL](PRD.md#counter-verification). Include action-level attempts for forbidden inputs, not just disabled controls. The [lifecycle matrix](PRD.md#lifecycle-matrix) defines expected outcomes; this roadmap names the fixture and phase that checks each. Reverify those checks after relevant later changes.

## Definition of done

Redeploy the current application on Vercel after each phase, using the hosting contract in [PRD section 1](PRD.md#1-technical-stack-end-state). Phase 8 adds the final health/container audit.

A phase is complete only when its named checks pass, its PR links its issue, and the [AGENTS verification checklist](../AGENTS.md#task-verification-checklist) passes. A completed app also passes every Phase 8 check locally and in CI, has no out-of-scope implementation, and has a verified production deployment.
