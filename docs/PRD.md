# Product requirements document: Beacon

## Problem statement

Readers and curators face slow, cluttered discussion platforms with opaque ranking, deep nested threads that are hard to follow, and dashboard interfaces that reload on simple actions. Users need a clean and fast text and link aggregator where public content loads instantly, discussions stay readable, and content management feels continuous.

## Solution

Beacon is a link and text aggregator with public discussion pages and an authenticated management dashboard. Visitors browse feeds sorted by hot, new, or top, filter by tag, view a popular tags directory, inspect post details, and view author profiles. Signed in users upvote on feeds and details, write comments up to one level deep, save posts to a private list, and track notifications. Authors draft, publish, edit, unpublish, and delete posts from a persistent dashboard shell.

## User stories

These stories describe scope. The sections below own the operative rules; the [glossary](glossary.md) owns domain definitions.

1. As an anonymous visitor, I want to browse the home feed, so that I can discover popular links and text posts.
2. As an anonymous visitor, I want to sort the feed by hot, new, and top, so that I can view posts by current momentum, publication time, or highest score.
3. As an anonymous visitor, I want to filter the feed by a specific tag, so that I can read content focused on a single topic.
4. As an anonymous visitor, I want to view a popular tags directory at `/tags`, so that I can see which topics have the most discussions.
5. As an anonymous visitor, I want clicking the title or domain pill on a link post in the feed to open the external destination in a new tab, so that I can view original sources without losing my place.
6. As an anonymous visitor, I want clicking the author name on any feed card to navigate to `/u/[username]`, and clicking other non link areas to navigate to `/p/[id]`, so that I can reach profiles and discussions.
7. As an anonymous visitor, I want clicking anywhere on a text post card through its stretched title link to navigate to `/p/[id]`, so that I can read the post content and discussion.
8. As an anonymous visitor, I want to view header images displayed at the top of post pages, so that I can see visual context for link or text posts.
9. As an anonymous visitor, I want to view public author profiles at `/u/[username]`, so that I can see their total karma and published posts.
10. As an anonymous visitor, I want to sign up with a unique username and email, so that I can join the community.
11. As a registered user, I want to log into my account, so that I can access my dashboard and participate in discussions.
12. As a registered user, I want to upvote a post on the feed or the detail page, so that I can support quality submissions and increase the author's karma.
13. As a registered user, I want to click an active upvote button a second time to toggle off, so that I can remove my vote if I change my mind.
14. As a registered user, I want to see my vote status update immediately, so that the action feels instantaneous.
15. As a registered user, I want to upvote a comment, so that I can reward helpful responses.
16. As a registered user, I want to write a top level comment on a published post, so that I can share my thoughts.
17. As a registered user, I want to reply directly to an existing top level comment, so that I can engage with another commenter.
18. As a registered user, I want the system to reject replies to nested comments, so that discussions never exceed one level of depth.
19. As a registered user, I want to save a post from its detail page to my private bookmark list, so that I can read it again later.
20. As a registered user, I want to view all my saved posts at `/dashboard/saved`, so that I can access my bookmarked reading list.
21. As a registered user, I want to filter my saved posts by tag, so that I can find saved articles on specific topics.
22. As a registered user, I want to remove a post from my saved list, so that I can keep my reading list current.
23. As an author, I want to create a new draft post with a required title and tag, and optional external url, header image url, and Markdown body, so that I can prepare title only discussions, link shares, or full text articles before publishing.
24. As an author, I want to view all my draft and published posts in `/dashboard/posts`, so that I can manage my submissions in one place.
25. As an author, I want to edit any field of a draft post, so that I can refine my submission before making it public.
26. As an author, I want to publish a draft post, so that it appears in the public feed and opens for community voting and comments.
27. As an author, I want to edit the body text and header image url of a published post, so that I can correct errors or update visual assets.
28. As an author, I want the title, external url, and tag to remain locked after publishing, so that post identity cannot be manipulated after receiving upvotes.
29. As an author, I want to unpublish a post only when it has zero comments and zero score, so that I can revert an accidental publication back to draft.
30. As an author, I want the system to block unpublishing when a post has comments or votes, so that active conversations and earned rank are not hidden.
31. As an author, I want to delete a draft post, so that unused drafts are completely removed from the database.
32. As an author, I want to delete a published post with zero comments, so that unwanted submissions leave no record. This path hard deletes the row.
33. As an author, I want deleting a published post with comments to mark the post as deleted without removing the comment tree, so that other users do not lose their discussion history.
34. As an author, I want to keep my earned karma when a post is deleted, so that my historical standing remains intact.
35. As an author, I want to receive a notification when someone comments on my post or replies to my comment, so that I can stay informed of replies.
36. As an author, I want to view my unread notification count in the root navbar bell, so that I know when new activity arrives on any route.
37. As an author, I want to view and mark notifications as read at `/dashboard/notifications`, single only, so that I can clear handled alerts.
38. As an author, I want my notification list to poll in the background without refreshing the page, so that I see new responses quickly.
39. As a user, I want navigating between dashboard routes to preserve the dashboard layout and notification state, so that switching sections is fast and free of layout shifts.

## Implementation decisions

### 1. Technical stack, end state

- Framework. Next.js 16.3 with App Router, `cacheComponents: true`, and `partialPrefetching: true`. These are end-state flags. [ROADMAP](ROADMAP.md#implementation-phases) owns their adoption order.
- Database. PostgreSQL on Neon. Local development and CI use a Postgres service container. Drizzle uses `node-postgres` Pool for interactive transactions.
- Auth. Better Auth with the username plugin and `displayUsername: false`. Login accepts username or email plus password. Signup requires a username. Normalize usernames to lowercase before validation. Require 3 to 30 characters matching `^[a-z0-9_-]+$`. Reject the exact reserved names `beacon`, `admin`, `moderator`, `support`, and `system`, case-insensitively. `src/features/auth/constants.ts` implements this contract for both form and server validation. The reserved-name change belongs to the prerequisite auth fix in the [ROADMAP](ROADMAP.md#prerequisite-fixes-after-phase-0).
- Data access. Feature queries in `src/features/<feature>/queries.ts` use `server-only` for reads. Server Actions in `actions.ts` handle writes. Every action checks the session and required ownership. No application API layer exists. Better Auth's handler and one infrastructure health route are exceptions. [ADR 0004](adr/0004-deploy-and-cache-topology.md) records the hosting rationale.
- Client state. TanStack Query handles notification preloading, hydration, and polling through Server Actions. TanStack Form handles post and comment forms. Provider placement is specified in [section 7](#7-dashboard-architecture-and-persistent-shell).
- UI. Tailwind CSS 4 and shadcn/ui. [Design rules](design-rules.md) own layout, tokens, and motion. [AGENTS](../AGENTS.md) owns fonts, commands, and code organization.
- Tests. Playwright verifies user-visible behavior against real seeded data. Do not mock the database. [ROADMAP testing decisions](ROADMAP.md#testing-decisions) assign automated and manual checks.
- Hosting. Vercel with Neon for V1. Preview environments use Neon branches, migrations run at release, and Better Auth base URL/trusted origins match each environment. Backups use Neon point-in-time restore. Keep a portable Dockerfile ready; Vercel itself needs no custom image or standalone output. The one health route checks infrastructure, not application data access. [ADR 0004](adr/0004-deploy-and-cache-topology.md) records the trade-off.

### 2. Data architecture and schema contracts

Use UUID primary keys. Every time column uses Drizzle `timestamp({ withTimezone: true })`, corresponding to Postgres `timestamptz`. The prerequisite schema fix converts existing Phase 0 auth columns with an explicit UTC interpretation of their legacy values. It adds a new migration, without rewriting the Phase 0 migration. Formatting uses the explicit UTC contract in [section 4](#4-feed-card-and-form-rules).

- `users`. `id`, `name` not null, `email` unique not null, `emailVerified` boolean default false not null, `image` nullable, `username` unique nullable at database level but required at signup, `karma` integer default 0 not null, `createdAt`, `updatedAt`. The prerequisite schema fix backfills null karma to zero before adding `NOT NULL`. The auth contract lives in [section 1](#1-technical-stack-end-state). No `displayUsername` column exists.
- `sessions`. `id`, `userId` not null cascade delete, `token` unique not null, `expiresAt`, `ipAddress` nullable, `userAgent` nullable, `createdAt`, `updatedAt`.
- `accounts`. `id`, `userId` not null cascade delete, `accountId`, `providerId`, `password` nullable, Better Auth token fields `accessToken`, `refreshToken`, `idToken`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`, and `scope`, plus `createdAt`, `updatedAt`. Keep the existing Better Auth field nullability.
- `verifications`. `id`, `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt`.
- `posts`. `id`, `authorId` nullable with set null on user delete, `title` not null, `url` nullable, `headerImageUrl` nullable, `body` nullable, `tag` not null, `score` integer default 0 not null, `commentCount` integer default 0 not null, `status` enum `draft` or `published` not null, `deletedAt` nullable, `createdAt` not null, `publishedAt` nullable. Lifecycle fields follow rows L5 to L8 and L18 below.
- `comments`. `id`, `postId` not null cascade delete, `authorId` not null cascade delete, `parentCommentId` nullable cascade delete, `body` not null, `score` integer default 0 not null, `createdAt` not null.
- `votes`. `id`, `userId` not null cascade delete, `postId` nullable cascade delete, `commentId` nullable cascade delete, `createdAt` not null. Unique on user plus post and user plus comment. CHECK `num_nonnulls(post_id, comment_id) = 1`.
- `saved_posts`. `id`, `userId` not null cascade delete, `postId` not null cascade delete, `createdAt` not null. Unique on user plus post.
- `notifications`. `id`, `userId` not null cascade delete, `type` enum `comment_on_post` or `reply_to_comment` not null, `sourceId` not null referencing the originating comment with cascade delete, `read` boolean default false not null, `createdAt` not null.

Indexes. Posts on `(status, deleted_at, published_at)` and on `tag`. Comments on `post_id` and `(post_id, parent_comment_id)`. Votes on `(post_id, user_id)` and `(comment_id, user_id)`. Saved posts on `(user_id, created_at)`. Notifications on `(user_id, read, created_at)`.

Use text columns with database CHECK constraints for the field limits in [section 4](#4-feed-card-and-form-rules). Require nonblank titles and comment bodies, reject CR and LF in stored titles, enforce the tag regex, and require nonnegative post/comment scores and post comment counts. Nullable fields allow null; their length checks apply when present. Form and action validation enforce URL schemes, reject credentials, and normalize inputs. A CHECK requires `publishedAt` when status is published, while an unpublished draft may retain its original publication timestamp. A CHECK requires soft-deleted posts to retain published status. No unique constraint or duplicate detection applies to external URLs. Multiple posts may share a URL.

[ROADMAP](ROADMAP.md#implementation-phases) owns migration phases. Domain tables are introduced in Phases 1, 4, and 6. Existing auth corrections belong to the prerequisite schema fix.

#### Seed contract and named fixtures

The planned `db:seed` command refuses `NODE_ENV=production` and any database other than an explicitly configured local or CI fixture database. Reruns reset domain tables and reseed them, leaving existing auth users intact. Find or create the login-capable fixture users `alice`, `bob`, and `charlie` through Better Auth's server API. Use fixture-only emails under `example.test` and the local test password `Beacon-fixture-2026!`. Bulk voter users may be inserted directly without password accounts. They are fixture records, not login-capable test users.

Generate IDs and values deterministically using a seeded random generator with seed `beacon-v1`. Use one explicit UTC reference instant, `SEED_REFERENCE_TIME`, defaulting to `2026-10-03T00:00:00Z`. Identical reference time and generator seed produce identical domain fixtures. The manifest records that instant. Time-sensitive checks account for real elapsed time after it; the fixture instant does not freeze the server or database clock. A manual reviewer can override the instant and restart the app after reseeding so server caches do not retain old fixtures.

Create exactly 45 published, non-deleted posts, one draft, and one soft-deleted post with a thread. Include these stable names in the seed manifest so tests and reviewers can find their IDs without guessing:

- `rank-old-high` has score 50 and age 24 hours at the reference instant. `rank-fresh` has score 5 and age 2 hours. `rank-zero` has score 0 and age 30 minutes. `rank-old-low` has score 1 and age 100 hours. These use tag `ranking`. Keep other posts in that tag below these fixtures in the hot/top comparison. Section 4 gives the expected formula values at the reference instant.
- `tie-a` and `tie-b` share score 3 and publication time six hours before the reference instant, and their UUIDs sort with `tie-a` first. They share tag `ties` and have no other posts in that tag. Both hot and top therefore exercise the final tie-breaker, as does new.
- `title-only`, `text-body`, `link-external`, `header-valid`, and `header-broken` exercise card and detail rendering. `link-external` points to `https://example.com/article`. `header-valid` uses a checked-in fixture served from `/fixtures/header.png` through an absolute local app URL. `header-broken` points to an absent `/fixtures/missing.png`. These are test assets, not a product image-upload feature.
- `thread-post` has 21 top level comments with equal score and ordered creation times. Name the first `thread-first` and the last `thread-last`; each has one reply by a different fixture user, named `reply-first` and `reply-last`. Page 1 has 20 top level comments plus `reply-first`; page 2 has `thread-last` plus `reply-last`; page 3 is not-found. These fixtures exercise ordering, pagination, and cross-page reply anchors. `deleted-thread` retains a thread after soft deletion. `draft-private` is never in public lists.
- `lifecycle-draft` is the single draft, also named `draft-private`, with tag `lifecycle`. `lifecycle-clean` is a published post in that tag with zero score and no comments. `lifecycle-thread` is a published post in that tag with comments. Reset fixtures between lifecycle checks. No other fixture uses tag `lifecycle`, so its initial public count is two. These names identify rows L5 to L8 and the corresponding tags-directory count checks.
- `alice` owns the draft and published posts for profile checks. `bob` has nonzero fixture karma. `charlie` has no public posts for the empty profile check. Include `date-relative` at reference age six days and 23 hours, and `date-absolute` at age seven days and one hour. Filler posts have zero score and publication times at least eight days before the reference instant, so they do not hide the named ranking/tie fixtures on page 1. Include enough filler posts to reach exactly 45 visible posts. There is no fixture with tag `unknown-fixture-tag` or username `unknown-fixture-user`.

Before Phase 4, seed literal post and comment scores without vote rows. Derive `commentCount` from inserted comments, including replies. Derive fixture karma as the sum of the seeded post and comment scores for each original author. Preserve the original author association in the seed manifest for `deleted-thread`, whose database `authorId` is null. This karma is a display fixture, not evidence of recorded votes. The score consistency SQL is expected to fail before Phase 4.

From Phase 4, insert real vote rows first, then derive post score, comment score, and fixture karma with SQL aggregates. A score of 50 requires 50 distinct voters other than the target author. Create enough bulk voter fixtures for the largest score. Honor target checks, uniqueness, and the self-vote prohibition. Historical votes on `deleted-thread` are fixture setup before its soft deletion. Derive its author's retained karma through the seed manifest before nulling `authorId`. The consistency SQL must return zero rows across the full fixture from Phase 4 onward. Reseeding starts a fresh fixture history; production karma is never recomputed after deletion.

### 3. Post lifecycle and mutation rules

The matrix is the canonical lifecycle rule list. Actors are signed-in users unless a row describes a public read. "Author" means the post author for post operations and the comment author for self-vote checks. A repeated publish or unpublish with no transition rejects; deleting an already soft-deleted post also rejects.

#### Lifecycle matrix

| ID | Operation | Draft | Published, non-deleted | Soft-deleted |
| --- | --- | --- | --- | --- |
| L1 | Feed, tag directory/feed, public profile | Hidden | Visible | Hidden |
| L2 | Direct `/p/[id]` | 404 for everyone | Visible | Placeholder and full thread, author shown as `[deleted]` |
| L3 | Create | Author creates with required title and tag; one action accepts Save draft or Publish | Direct creation uses the same publish rules as L5 | Not a creation state |
| L4 | Edit | Author may edit all fields | Author may edit only body and header image; title, URL, and tag changes reject at the action | Rejected |
| L5 | Publish | Author transitions to published | Rejected, no transition | Rejected |
| L6 | Unpublish | Rejected, no transition | Author only, conditional on `commentCount = 0` and `score = 0` | Rejected |
| L7 | Delete | Author hard-deletes | Author hard-deletes at zero comments; otherwise soft-deletes | Rejected |
| L8 | Soft-delete field transformation | Not applicable | Set `deletedAt`, null `authorId`, clear `headerImageUrl`, replace body with `This post was deleted by the author.`; retain title, URL, tag, score, and commentCount | Keep this placeholder state |
| L9 | Vote on post | Rejected | Upvote only, no self vote, no automatic author vote | Rejected |
| L10 | Vote on comment | Rejected | Upvote only, no self vote on the comment | Rejected |
| L11 | Toggle off vote | Rejected | Remove the user's existing vote | Rejected, including removal |
| L12 | Create top level comment | Rejected | Allowed; increment commentCount in the same transaction | Rejected |
| L13 | Reply | Rejected | Parent must exist in the same post and have no parent; increment commentCount in the same transaction | Rejected |
| L14 | Save | Rejected | Allowed from detail page only | Rejected |
| L15 | Saved-list visibility | Hidden | Visible to the saving user | Hidden |
| L16 | Unsave | User may remove their existing private bookmark | User may remove their existing private bookmark | User may remove their existing private bookmark |
| L17 | Vote counters and karma | No voting | Score and karma change by +1 or -1 only when the vote insert/delete changes a row | Deletion retains earned karma; frozen votes change nothing |
| L18 | Publication timestamp | Null before first publish; retain original timestamp after unpublish | Set once on first publish; edits and republishing never change it | Retain it |
| L19 | Comment notification | No comments | Top level notifies post author; reply notifies only parent comment author; no self-notify | No new comments or notifications |
| L20 | Authorization | Every write checks session; author operations require ownership | Same checks; vote/comment/save need a signed-in user | Reject post/content writes server-side regardless of controls; private bookmark removal remains allowed by L16 |

No V1 action edits or deletes comments. No V1 path deletes users. The existing user cascade deletes votes without counter repair, which is why user deletion remains outside scope. Karma retains historical credit after content deletion, so live scores cannot reconstruct it.

#### Shared transaction and lock order

Every post-affecting write uses one interactive transaction. Check the session first. For a new submission, insert its draft row inside the transaction; that transaction owns the new row and may apply L5 before commit. For an existing post, lock the owning post with `SELECT ... FOR UPDATE`, then read its current status, deletion state, author, score, and commentCount. Check ownership or other permissions from that locked row, not an earlier client value. A missing row returns `post no longer exists`. A disallowed state rejects without partial changes.

Lock order is post, then target or parent comment when applicable, then the target author's user row for karma writes. Vote insert/delete, score arithmetic, and karma arithmetic happen within this transaction. Use SQL `score = score + 1` or `score - 1` and equivalent karma arithmetic, never a read-then-write counter. The unique vote constraints remain authoritative. Two overlapping toggles serialize on the post and each applies once to the state it observes.

For comment creation, lock and validate the reply parent after locking the post. Insert the comment and conditionally increment commentCount only for a published, non-deleted post. Zero changed rows rejects and rolls back the insert. From Phase 6, insert notifications in this same transaction. If a foreign-key failure still indicates a missing post, roll back and return `post no longer exists`.

Unpublish checks L6 while holding the post lock and uses a conditional update. Delete checks the current count under that lock and chooses L7. A conditional hard delete that changes zero rows must reread the locked state and take the soft-delete path only if comments now exist and the action is still permitted. Capture the author username before applying L8 for cache invalidation. Rejections never change counters, karma, or content.

When a vote wins before unpublish, unpublish sees the resulting score and rejects if nonzero. If unpublish wins, the later vote rejects the draft state. When a comment wins before delete, delete preserves its thread through soft deletion. If delete wins first, a later comment rejects a missing or soft-deleted post. A vote that commits before deletion retains its karma credit; a later vote or toggle off rejects. Comment votes use the same owning-post lock, so soft deletion freezes them too. Publishing and edits serialize through this same contract.

Save also locks and validates the post before inserting the unique bookmark. Unsave removes only the current user's bookmark and needs no live-post state guard. Mark-read updates only the current user's notification. These private removals do not mutate public post state.

#### Counter verification

From Phase 4 onward, run both queries after manual vote tests and reseeding. Both must return zero rows across all posts and comments. Before Phase 4, synthetic scores make failure expected, as defined in the [seed contract](#seed-contract-and-named-fixtures).

```sql
select p.id from posts p
left join votes v on v.post_id = p.id
group by p.id
having p.score <> count(v.id);
```

```sql
select c.id from comments c
left join votes v on v.comment_id = c.id
group by c.id
having c.score <> count(v.id);
```

Notifications link to `/p/[id]?comment={commentId}#comment-{commentId}`. The [thread navigation contract](#thread-navigation) resolves its current page. Null recipients create no notification. Better Auth's default rate limiter stays on. Comment actions allow at most 10 per minute per user, and vote actions allow at most 60 per minute per user. These limits can change without migration; their implementation phase is assigned in the [ROADMAP](ROADMAP.md#phase-4-voting-comments-and-saved-posts).

### 4. Feed, card, and form rules

[Glossary](glossary.md) defines link posts, text posts, tags, and feeds.

- Sorts. Default is hot. Invalid `sort` falls back to hot. `/?sort=hot` redirects to `/`, preserving a valid non-default page. `/t/[tag]` is always hot and has no sort parameter. Feed takes `sort` as a prop.
- New. Order published, non-deleted posts by `publishedAt DESC, id ASC`.
- Top. Order by `score DESC, publishedAt DESC, id ASC`, all time with no window. [ADR 0003](adr/0003-hot-and-top-ordering.md) records the rationale.
- Hot. Order by `(score + 1) / (age_hours + 2)^1.5` descending, with age from `publishedAt`, then `publishedAt DESC, id ASC`. Clamp negative age to zero for clock skew. Keep the exponent in one named constant. At exponent 1.5, `rank-old-high` scores 0.385, `rank-fresh` 0.750, `rank-zero` 0.253, and `rank-old-low` 0.002 at the seed reference time. Their order is fresh, old-high, zero, old-low.
- Other lists. Profile posts use `publishedAt DESC, id ASC`. Dashboard posts use `createdAt DESC, id ASC`. Saved posts use the bookmark's `createdAt DESC, id ASC`. Notifications use `createdAt DESC, id ASC`. Top level comments use `score DESC, createdAt ASC, id ASC`; replies use `createdAt ASC, id ASC`.
- Pagination. Every paginated list uses `?page=` and one shared page-size constant of 20. Fetch 21 rows to detect Next, without a total-count query. Show Previous and Next, no page numbers. Non-integer or below-one pages behave as 1. Explicit `page=1` redirects to the same route without that parameter, preserving other valid filters. A page beyond the last page returns 404. An empty list at page 1 renders its empty state. Offset drift after new posts is accepted. The detail thread paginates top level comments, with all replies to each of those comments included on the same page. The 21st top level comment detects Next; replies do not consume page slots. Thread ordering precedes pagination. Notification polling follows the active page and returns a separate unread count.
- Tags directory. Group published, non-deleted posts by tag, ordered by count DESC then tag ASC. No tags table. A tag with no public posts is absent and its feed returns 404.
- Tag format. Lowercase slug matching `^[a-z0-9]+(-[a-z0-9]+)*$`, maximum 30 characters. Form and action lowercase before validation. Any user can introduce a tag on publish.
- Feed cards. Use one stretched internal link per card. A text post's title stretches to its detail page. A link post's title and domain pill open its external URL; its comments link stretches to the detail page and has an accurate accessible name. Author links go to `/u/[username]` on a raised layer above the stretch. Only stretched links explicitly set `prefetch={true}`. External anchors never prefetch. Internal author links use the framework default.
- External links. Title, domain pill, detail title, and body links open a new tab with `target="_blank"` and `rel="noopener noreferrer nofollow ugc"`.
- Domain pill. Show the parsed hostname without leading `www.`, plus an arrow. For example, `blog.rust-lang.org`. Hide the pill if parsing fails; the write path still validates URLs.
- Header image. Use a plain `img` with lazy loading, `referrerPolicy="no-referrer"`, and fixed 16/9 aspect with `object-cover`. A small client component handles `onError` by replacing the failed image with a neutral fallback in the same aspect-ratio box. There is one header image slot, with no images inside bodies. Third-party hosts can see visitor IPs.
- Body. Render with `react-markdown` and its default URL transform, no raw HTML, and no image nodes. Comments render as plain text.
- Inputs. Trim all inputs. Collapse title CR/LF runs to spaces. Normalize blank optional fields to null. Title is required, nonblank, and at most 200 characters. URL and header image URL are at most 2048 characters, parse with `new URL()`, use only HTTP or HTTPS, and contain no username or password credentials. Body is at most 20000 characters. Comment body is required, nonblank, and at most 5000 characters. Form and Server Action apply these checks; [section 2](#2-data-architecture-and-schema-contracts) defines database enforcement.
- Dates. Use `Intl.RelativeTimeFormat('en-US', { numeric: 'always' })` for elapsed times under exactly seven days. Clamp future elapsed time to zero. Under 60 seconds show `just now`; otherwise floor elapsed minutes below one hour, hours below one day, and days below seven days. At seven days or older, use `Intl.DateTimeFormat('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric' })`, such as `Oct 3, 2026`. Render `<time dateTime={iso}>` with the full ISO UTC timestamp as `title`. Server-rendered relative text may age until its cache entry refreshes. No client ticking timer or date library.

### 5. Route map

| Route | Purpose |
| --- | --- |
| `/` | Feed with sort and page parameters, hot page 1 canonicalized to `/` |
| `/t/[tag]` | Hot tag feed with page parameter; unknown tag 404 |
| `/tags` | Popular tags and public post counts |
| `/p/[id]` | Detail and paginated thread according to L2, with `?page=` and optional `?comment=` focus hint; malformed UUID 404 before querying |
| `/u/[username]` | Karma and public post history; unknown username 404 |
| `/login`, `/signup` | Better Auth forms; signed-in visits redirect to `/dashboard` |
| `/dashboard` | Current karma, draft/published counts, unread count, and five latest notifications |
| `/dashboard/posts` | Own posts with `?tab=All,Published,Drafts` |
| `/dashboard/posts/new` | Save draft and Publish form |
| `/dashboard/posts/[id]/edit` | Author edit form; the deliberate `instant = false` blocking exception |
| `/dashboard/saved` | Private saved posts with `?tag=` filter and L15 visibility |
| `/dashboard/notifications` | Notification list and single mark-read |
| `/dashboard/settings` | Email editable, username locked, otherwise read-only |

The prerequisite auth fix makes `proxy.ts` preserve the dashboard pathname and query string in `/login?returnTo=...`. Login accepts only a local destination whose normalized pathname is `/dashboard` or begins `/dashboard/`. Reject absolute URLs, protocol-relative URLs, backslashes, and non-dashboard paths; default to `/dashboard`. A fragment is not available to the proxy. Every Server Action independently checks the session.

On `/login` and `/signup`, a nested async Server Component reads the Better Auth session through request headers inside Suspense, outside any `use cache` scope. It redirects signed-in users and renders the form for anonymous visitors. With Cache Components, this request API access makes that subtree dynamic; do not use the unsupported `dynamic = 'force-dynamic'` segment option. During the earlier flags-off phases the same session read is request-time work. The form fallback must not flash an authenticated form before the session check resolves.

In this document, "404" means calling Next.js `notFound()` and rendering not-found UI without exposing unavailable content. The bundled `not-found` guide specifies HTTP 404 for non-streamed responses and HTTP 200 when streaming has already started. Tests assert the UI and absent private content; they do not require HTTP 404 for an already-streamed response. Do not block the shell with a new validity query solely to force a status code.

Add `not-found.tsx`, `error.tsx`, and `loading.tsx`, with empty feed, empty profile, and no-comments states. An empty tag disappears under the tag-directory rule. Full SEO at app completion includes route metadata, canonicals for sort/page, robots, and sitemap. [ROADMAP](ROADMAP.md#phase-8-automated-tests-full-seo-and-audit) owns that phase.

### 6. Route caching and invalidation matrix

The matrix describes the end state; [ROADMAP](ROADMAP.md#implementation-phases) assigns adoption phases. Use real `cacheLife` profiles, never invented short/medium/long names.

| Route or segment | Strategy | Cache tags |
| --- | --- | --- |
| `/` hot | Cached list query with `cacheLife('minutes')` | `feed` |
| `/` new or top | Cached list query with `cacheLife('hours')` | `feed` |
| `/t/[tag]` | Cached hot list query with `cacheLife('minutes')` | `feed-{tag}` |
| `/tags` | Cached aggregation with `cacheLife('days')` | `tags` |
| `/p/[id]` public body/state | Cached query with `cacheLife('hours')`, including tagged missing/draft results | `post-{id}` |
| `/p/[id]` thread | Separate Suspense boundary, cached thread-only query with `cacheLife('minutes')` | `comments-{postId}` |
| `/p/[id]?comment=` locator | Cached ancestor/page lookup with `cacheLife('minutes')` | `comments-{postId}` |
| `/p/[id]` visitor controls | Dynamic Suspense island, never cached | None |
| `/` and `/t/[tag]` vote controls | Dynamic island per page, never cached | None |
| `/u/[username]` | Cached profile/history with `cacheLife('hours')` | `profile-{username}` |
| `/login`, `/signup` | Dynamic session/form subtree inside Suspense, as specified in section 5 | None |
| `/dashboard/*` | Dynamic session-specific reads | None |
| `/dashboard/posts/[id]/edit` | Dynamic reads and `export const instant = false` | None |

Cache arguments include resolved sort, tag, and page where applicable. Do not wrap these lists in a longer-lived cached parent that masks hot refreshes. The home query uses `feed`; tag-filtered queries use `feed-{tag}`. Mutations invalidate both where required below.

The detail query attaches `post-{id}` before checking for a matching published row. It returns a public record or a null sentinel; the component calls `notFound()` on null outside the cached query. Draft content never enters the public cache, but the null result may be cached. Publish invalidates `post-{id}` specifically to clear that cached draft/missing result. Do not add an uncached visibility query before this read, which would delay prefetched detail content.

Read the public body/state before requesting the thread. The cached thread takes post ID and resolved thread page as arguments and contains only comments, not post status or enabled-control decisions. Post state comes from `post-{id}` outside the thread cache. Soft deletion leaves thread data unchanged; hard deletion is possible only without comments; unpublish is possible only without comments. Therefore delete/unpublish need no `comments-{id}` invalidation. Visitor controls use the public state and their dynamic session reads; action guards remain authoritative.

The detail visitor island fetches the current user's post vote, comment votes across the thread's ID list, and saved state. Anonymous visitors skip those queries and receive a neutral shell. Feed vote state uses one query for the page's post IDs. No session, cookies, or headers are read inside `use cache`, including through a called helper.

#### Thread navigation

A valid `?comment=<commentId>` hint selects the current page containing that comment's top level ancestor. Resolve that ancestor within the requested post, find its one-based position in the section 4 top level ordering, and use `floor((position - 1) / pageSize) + 1`. This hint overrides `?page=` for that visit. A malformed, missing, or foreign-post comment hint is ignored and normal page handling applies. Replies stay on their parent's page. Previous/Next links clear the comment hint so explicit paging works. The anchor `#comment-{id}` identifies the comment or reply after its page renders.

The locator is a cached public query with post ID and comment ID as arguments, `cacheLife('minutes')`, and tag `comments-{postId}`, using the same ordering as the thread read. Comment create/vote invalidations clear both it and thread reads. It queries the ancestor's ordered position, not a total-list count for pagination. Successful comment submission navigates to `/p/{postId}?comment={newCommentId}#comment-{newCommentId}` after committing and invalidating, so the submitted comment is visible even when it lands on a later page. Canonicals omit the focus hint and use the resolved normal page URL.

#### Mutation refresh targets

Run `updateTag` only after a successful transaction, using the captured author username where relevant. Zero-row rejections do not invalidate. Do not use deprecated single-argument `revalidateTag` in Server Actions.

| Mutation | Public `updateTag` targets | Dynamic or client refresh |
| --- | --- | --- |
| Post vote/toggle off | `post-{id}`, `feed`, `feed-{tag}`, `profile-{authorUsername}` | Reconcile optimistic vote state with the action result |
| Comment vote/toggle off | `comments-{postId}`, `profile-{commentAuthorUsername}` | Reconcile optimistic comment vote state |
| Publish, including new published creation | `post-{id}`, `feed`, `feed-{tag}`, `tags`, `profile-{authorUsername}` | Navigate after success; post tag clears a cached draft/missing result |
| Comment/reply creation | `comments-{postId}`, `post-{id}`, `feed`, `feed-{tag}` | Navigate through the new comment hint; notification polling discovers new alerts |
| Published body/image edit | `post-{id}` | Navigate after success |
| Delete or unpublish | `post-{id}`, `feed`, `feed-{tag}`, `tags`, `profile-{authorUsername}` | Navigate after success; thread cache has no post state |
| Draft create/edit | None | Dynamic dashboard list shows the row on its next render; successful form save navigates to that list |
| Draft delete | None | Navigate to the dynamic dashboard list |
| Save/unsave | None | Reconcile optimistic saved state, then refresh the detail island or active saved list with `router.refresh()` |
| Mark notification read | None | Reconcile optimistic read state, then invalidate the shared TanStack notification query key |
| Email settings update | None | Refresh the dynamic account display after Better Auth confirms the update |

Auth uses Better Auth's handler rather than a new application action/API. After login, navigate to the validated destination and refresh session-dependent UI. Signup navigates to `/dashboard` and refreshes it. Signout returns to `/`, clears session-specific query state, and refreshes the visitor UI. No public cache tag changes for these auth operations.

Prefetching begins on stretched feed links in Phase 1 production. Before partial prefetching, explicit `prefetch={true}` may fetch the full destination. With partial prefetching, the route's shell is shared and explicit prefetch can resolve cached URL-specific body and thread content before navigation. Uncached visitor sections stream behind Suspense. Cached sections may already be ready; do not promise that comments stream on every click. [ROADMAP Phase 3](ROADMAP.md#phase-3-partial-prefetching) tests a controlled slow, cold comments read. Motion is governed by [design rules](design-rules.md#animation-and-transition-standards).

V1 uses the default per-instance memory cache with no shared handler. Before scaling to multiple always-on containers, add a shared cache handler. Hosting and environment rules live in [section 1](#1-technical-stack-end-state); [ADR 0004](adr/0004-deploy-and-cache-topology.md) records the rationale.

### 7. Dashboard architecture and persistent shell

- `QueryClientProvider` lives in the root layout with a stable browser QueryClient, so navbar and dashboard consumers share it. [ROADMAP](ROADMAP.md#phase-1-public-pages-without-caching) assigns installation and mounting.
- Root navbar owns the bell and unread count. Dashboard layout adds only its sidebar and content pane. Layout and transition boundaries live in [design rules](design-rules.md).
- `getNotifications` returns the active list page plus total unread count. Bell and list share one query-key family, one active-page query, and one poll. Poll only when signed in, every 15 seconds, pause in background tabs, and keep requests single-flight. The key includes user ID and page; mark-read invalidates that user's notification key family so all cached pages refresh. Clear it on signout or account change.
- Preload on the server through `getNotifications`, pass through `HydrationBoundary`, and use `useSuspenseQuery` with the Server Action as `queryFn`. This session-aware read is the explicit client polling exception to Server Component reads; it creates no application API route.
- Optimistic feedback is limited to vote, save, and mark-read. Use `useOptimistic` inside `useTransition`, reconcile with committed results, and roll back failures. Publish, unpublish, and delete wait for the server and navigate on success.
- Across dashboard navigation, keep sidebar and badge mounted. Preserve notification query data and pending optimistic mutations in the root provider/shared action owners. A completed vote/save result persists through its database write; do not imply that an unmounted component's local `useOptimistic` state survives navigation. Refetch other route content as needed.

## Out of scope

- Downvotes, deeper comment trees, comment edit/delete, and multiple tags per post.
- Saved-post folders, custom labels, or public bookmarks; bulk mark-all-read.
- Image uploads/storage or image nodes in Markdown bodies. Header URLs may reference external hosts.
- Direct messages, mentions, admin moderation consoles, reporting flows, or automated spam filtering.
- WebSockets or server-sent events; a separate application API or SDK layer.
- Full-text/fuzzy search, deferred to V2.
- Email verification, password reset, username changes, karma trends, and user deletion in V1.
- Edited labels and `updatedAt` on posts.
- Time-windowed top ordering.
- Full SEO before app completion.

## Document ownership and rationale

[Glossary](glossary.md) owns definitions. This PRD owns schema, product behavior, and cache rules. [ROADMAP](ROADMAP.md) owns phases and checks. [Design rules](design-rules.md) own layout, tokens, viewports, and motion. [AGENTS](../AGENTS.md) owns commands, fonts, repository layout, and agent workflow. ADRs record rationale and link to these contracts: [soft deletion](adr/0001-soft-delete-for-published-posts-with-comments.md), [counters](adr/0002-post-score-and-karma-counters.md), [ordering](adr/0003-hot-and-top-ordering.md), and [hosting](adr/0004-deploy-and-cache-topology.md).
