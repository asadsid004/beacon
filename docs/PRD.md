# Product requirements document: Beacon

## Problem statement

Readers and curators face slow, cluttered discussion platforms with opaque ranking algorithms, deep nested comment trees that are hard to follow, and dashboard interfaces that trigger full-page reloads for simple actions. Users need a clean, fast text and link aggregator where public content loads instantly, discussions stay readable, and content management feels responsive and continuous.

## Solution

Beacon is a link and text aggregator with public discussion pages and an authenticated management dashboard. Visitors browse feeds sorted by new, hot, or top, filter by tag, view a popular tags directory, inspect post details, and view author profiles. Authenticated users upvote, write comments up to one level deep, save posts to a private list, and track notifications. Authors draft, publish, edit, and delete posts from a persistent dashboard shell that never unmounts during internal navigation.

## User stories

1. As an anonymous visitor, I want to browse the home feed, so that I can discover popular links and text posts.
2. As an anonymous visitor, I want to sort the feed by new, top, and hot, so that I can view posts by recent activity, highest score, or current momentum.
3. As an anonymous visitor, I want to filter the feed by a specific tag, so that I can read content focused on a single topic.
4. As an anonymous visitor, I want to view a popular tags directory at `/tags`, so that I can see which topics have the most discussions.
5. As an anonymous visitor, I want clicking the title or domain pill on a link post in the feed to open the external destination in a new tab, so that I can view original sources without losing my place.
6. As an anonymous visitor, I want clicking any area of a link post card outside the title and domain pill (such as the card surface, author, timestamp, or comment button) to navigate to `/p/[id]`, so that I can read the discussion.
7. As an anonymous visitor, I want clicking anywhere on a text post card (including the title) to navigate to `/p/[id]`, so that I can read the post content and discussion.
8. As an anonymous visitor, I want to view header images displayed at the top of post pages, so that I can see visual context provided by the author regardless of whether the post is a link or text post.
9. As an anonymous visitor, I want to view public author profiles at `/u/[username]`, so that I can see their total karma and published posts.
10. As an anonymous visitor, I want to sign up with a unique username and email, so that I can join the community.
11. As a registered user, I want to log into my account, so that I can access my dashboard and participate in discussions.
12. As a registered user, I want to upvote a post, so that I can support quality submissions and increase the author's karma.
13. As a registered user, I want to click an active upvote button a second time, so that I can remove my vote if I change my mind.
14. As a registered user, I want to see my vote status update immediately in the user interface, so that the action feels instantaneous.
15. As a registered user, I want to upvote a comment, so that I can reward helpful responses.
16. As a registered user, I want to write a top-level comment on a published post, so that I can share my thoughts.
17. As a registered user, I want to reply directly to an existing comment, so that I can engage with another commenter.
18. As a registered user, I want the system to reject replies to nested comments, so that comment discussions remain readable and never exceed one level of depth.
19. As a registered user, I want to save a post to my private bookmark list, so that I can read it again later.
20. As a registered user, I want to view all my saved posts at `/dashboard/saved`, so that I can access my bookmarked reading list.
21. As a registered user, I want to filter my saved posts by author tag, so that I can find saved articles on specific topics.
22. As a registered user, I want to remove a post from my saved list, so that I can keep my reading list current.
23. As an author, I want to create a new draft post with a required title and tag, and optional external URL, header image URL, and Markdown body, so that I can prepare title-only discussions, link shares, or full text articles before publishing.
24. As an author, I want to view all my draft and published posts in `/dashboard/posts`, so that I can manage my submissions in one place.
25. As an author, I want to edit any field of a draft post, so that I can refine my submission before making it public.
26. As an author, I want to publish a draft post, so that it appears in the public feed and opens for community voting and comments.
27. As an author, I want to edit the body text and header image URL of a published post, so that I can correct errors or update visual assets.
28. As an author, I want the title and external URL to remain locked after publishing, so that post identity cannot be manipulated after receiving upvotes.
29. As an author, I want to unpublish a post if it has zero comments, so that I can revert an accidental publication back to draft.
30. As an author, I want the system to block unpublishing if a post has comments, so that active public conversations are not abruptly hidden.
31. As an author, I want to delete a draft post, so that unused drafts are completely removed from the database.
32. As an author, I want to delete a published post with zero comments, so that unwanted submissions leave no record.
33. As an author, I want deleting a published post with comments to mark the post as deleted without removing the comment tree, so that other users do not lose their discussion history.
34. As an author, I want to keep my earned karma when a post is deleted, so that my historical community standing remains intact.
35. As an author, I want to receive a notification when someone comments on my post or replies to my comment, so that I can stay informed of replies.
36. As an author, I want to view my unread notification count in the dashboard header, so that I know when new activity arrives.
37. As an author, I want to view and mark notifications as read at `/dashboard/notifications`, so that I can clear handled alerts.
38. As an author, I want my notification list to poll for updates in the background without refreshing the page, so that I see new responses quickly.
39. As a user, I want navigating between dashboard routes to preserve the dashboard layout and notification state, so that switching sections is fast and free of layout shifts.

## Implementation decisions

### 1. Technical stack

- **Framework:** Next.js 16.3 with App Router, `cacheComponents: true`, and `partialPrefetching: true`.
- **Database:** PostgreSQL on Neon.
- **ORM:** Drizzle ORM.
- **Authentication:** Better Auth with a required username field during registration.
- **Code standards and linter:** Ultracite with Oxlint and Oxfmt, Husky pre-commit hooks, and React Doctor CLI and oxlint plugin rules enabled.
- **Continuous integration:** GitHub Actions running Ultracite, type checks, production builds, and React Doctor.
- **Data access:** Direct database access via a shared data-access module of plain async Drizzle query functions, called directly by Server Components for reads and Server Actions for writes. No separate application API layer.
- **Client state and polling:** TanStack Query for notification preloading, hydration, and background client polling via Server Actions.
- **Form management:** TanStack Form for post and comment submissions.
- **UI components and styling:** Tailwind CSS and shadcn/ui.
- **End-to-end testing:** Playwright for instant navigation and browser integration testing.
- **Hosting and deployment:** Hostinger VPS managed with Coolify and Traefik reverse proxy.

### 2. Data architecture and schema contracts

The database runs on Postgres using Drizzle ORM. UUIDs serve as primary keys across all tables.

- `users`: stores `id`, unique lowercase `username`, unique `email`, `karma` with integer default 0, and `createdAt`.
- `sessions`: stores `id`, `userId` referencing `users.id` with cascade delete, `token`, `expiresAt`, `ipAddress`, `userAgent`, `createdAt`, and `updatedAt`.
- `accounts`: stores `id`, `userId` referencing `users.id` with cascade delete, `accountId`, `providerId`, `password`, `createdAt`, and `updatedAt`.
- `verifications`: stores `id`, `identifier`, `value`, `expiresAt`, `createdAt`, and `updatedAt`.
- `posts`: stores `id`, nullable `authorId` referencing `users.id` with set null on delete, required `title` plain text string, nullable external `url`, nullable `headerImageUrl` cleared on soft delete, optional Markdown `body`, required lowercase slug `tag`, denormalized `score`, denormalized `commentCount`, enum `status` of draft or published, nullable `deletedAt` timestamp marking a soft-deleted post, and `createdAt`.
- `comments`: stores `id`, `postId` referencing `posts.id` with cascade delete, `authorId` referencing `users.id` with cascade delete, nullable `parentCommentId` referencing `comments.id` with cascade delete, `body`, `score`, and `createdAt`.
- `votes`: stores `id`, `userId` referencing `users.id` with cascade delete, nullable `postId` referencing `posts.id` with cascade delete, nullable `commentId` referencing `comments.id` with cascade delete, and `createdAt`. Unique constraints enforce one vote per user and post, and one vote per user and comment. Exactly one target ID is populated.
- `saved_posts`: stores `id`, `userId` referencing `users.id` with cascade delete, `postId` referencing `posts.id` with cascade delete, and `createdAt`. Has a unique constraint on user and post.
- `notifications`: stores `id`, `userId` referencing `users.id` with cascade delete, enum `type` of comment_on_post or reply_to_comment, `sourceId` UUID referencing the originating comment with cascade delete, boolean `read`, and `createdAt`.

### 3. Post lifecycle and mutation rules

- **Draft creation:** Authors create posts in `draft` status. Drafts are excluded from all public feeds and profile views.
- **Publishing:** Transitions a post from `draft` to `published`. Triggers cache invalidation for public feeds and the tag directory.
- **Unpublishing:** Only permitted when `commentCount` equals zero. An author cannot unpublish a post that has active comments.
- **Deletion:** Hard delete occurs if `commentCount` equals zero, removing the row entirely. If `commentCount` is greater than zero, the system executes a soft delete instead: it sets `deletedAt` to the current time, sets `authorId` to null, clears `headerImageUrl`, and replaces `body` with the fixed string `"This post was deleted by the author."` `title`, `url`, `tag`, `score`, and `commentCount` are left untouched, since the comment thread still relies on them for context. Feed, tag, and profile queries exclude any post where `deletedAt` is set. The direct `/p/[id]` link continues to resolve and render normally, including the full comment tree. A soft-deleted post accepts no further votes or comments, and is no longer editable on any field once deleted.
- **Field-level edit permissions:** For drafts, all fields (`title`, `url`, `headerImageUrl`, `body`, `tag`) are mutable. For published posts that have not been soft-deleted, `title` and `url` are permanently locked; only `body` and `headerImageUrl` remain editable at any time.
- **Author karma:** Votes increment or decrement the author karma on the `users` row inside the vote transaction. Karma earned from deleted posts is not removed.

### 4. Feed card interaction and form rules

- **Link post clicks in feed:**
  - Clicking the post title or adjacent domain pill (such as `blog.rust-lang.org ↗`) opens the external link in a new browser tab with `target="_blank"` and `rel="noopener noreferrer"`.
  - Clicking any other area of the card (the card container, author username, timestamp, or comment count button) performs client-side navigation to the post discussion at `/p/[id]`.
- **Text post clicks in feed:**
  - Clicking anywhere on a text post card, including the title, performs client-side navigation to `/p/[id]`.
- **Header image rendering:**
  - When `headerImageUrl` is provided, it renders as a full-width header banner at the top of `/p/[id]`. It applies to both link posts and text posts.
- **Form validation and content requirements:**
  - The submission form at `/dashboard/posts/new` and edit forms require only two fields: a non-empty `title` (plain text string) and a `tag` (lowercase slug).
  - The `url`, `headerImageUrl`, and `body` fields are optional for all posts. This supports title-only discussions, link submissions with or without commentary, and long-form text articles without conditional validation logic.

### 5. Route map

Public routes:

| Route               | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `/`                 | feed list, `sort` query param for new, hot, or top |
| `/t/[tag]`          | feed list, filtered by single tag                  |
| `/tags`             | popular tags directory with post counts            |
| `/p/[id]`           | post detail page, header image, and comments       |
| `/u/[username]`     | public author profile: karma and post history      |
| `/login`, `/signup` | Better Auth authentication forms                   |

Dashboard routes, authenticated, mounted under a persistent layout:

| Route                        | Purpose                                           |
| ---------------------------- | ------------------------------------------------- |
| `/dashboard`                 | overview: karma trend, recent activity            |
| `/dashboard/posts`           | your posts, draft and published, manage from here |
| `/dashboard/posts/new`       | submission form                                   |
| `/dashboard/posts/[id]/edit` | edit form                                         |
| `/dashboard/saved`           | private saved posts with author tag filtering     |
| `/dashboard/notifications`   | comment and reply notifications                   |
| `/dashboard/settings`        | account profile: username and email               |

### 6. Route caching and invalidation matrix

Every route segment follows this cache strategy:

| Route / segment              | Strategy                                                                        | `cacheTag`           | Invalidated by                                                    |
| ---------------------------- | ------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------- |
| `/` feed list                | `'use cache'`, `cacheLife` short for `new`, medium for `hot`, long for `top`    | `feed`, `feed-{tag}` | any vote, any new post, delete, or unpublish                      |
| `/t/[tag]`                   | `'use cache'`, tag-scoped                                                       | `feed-{tag}`         | vote or post within that tag                                      |
| `/tags`                      | `'use cache'`, long `cacheLife`                                                 | `tags`               | new post with a new tag, or post deleted                          |
| `/p/[id]` post body          | `'use cache'`, medium `cacheLife`                                               | `post-{id}`          | edit, vote on that post, delete                                   |
| `/p/[id]` comments           | separate Suspense boundary under post, `'use cache'` on read, short `cacheLife` | `comments-{postId}`  | new comment, vote on a comment                                    |
| `/p/[id]` your-vote-state    | dynamic, not cached, resolved per visitor inside Suspense boundary              | n/a                  | n/a, never cached                                                 |
| `/u/[username]`              | `'use cache'`, medium `cacheLife`                                               | `profile-{username}` | new post by that author, vote changing author karma, post deleted |
| `/dashboard/*`               | not cached, dynamic by nature                                                   | n/a                  | n/a                                                               |
| `/dashboard/saved`           | not cached, dynamic by nature                                                   | n/a                  | n/a                                                               |
| `/dashboard/posts/[id]/edit` | `export const instant = false`                                                  | n/a                  | n/a, deliberately blocking                                        |

**Server Action invalidation targets:**

- **Vote on post:** invalidates `post-{id}`, `feed`, `feed-{tag}`, and `profile-{authorUsername}`.
- **Vote on comment:** invalidates `comments-{postId}` and `profile-{commentAuthorUsername}`.
- **Create published post:** invalidates `feed`, `feed-{tag}`, `tags`, and `profile-{authorUsername}`.
- **Edit published post body or header image:** invalidates `post-{id}`.
- **Delete or unpublish post:** invalidates `post-{id}`, `feed`, `feed-{tag}`, `tags`, and `profile-{authorUsername}`. Capture the author's username before nulling `authorId` on a soft delete, since the profile tag still needs it after the row is cleared.

**Prefetching and View Transitions:**

- Feed links to `/p/[id]` use `<Link prefetch={true}>` so title, score, and header image resolve before click, while body and comments stream in after navigation.
- Post detail and comments are each wrapped in a `<Crossfade>` transition component so they do not pop in simultaneously.
- Vote count changes use `<ViewTransition>` so feed reordering does not jump.

### 7. Dashboard architecture and persistent shell

- The dashboard layout wraps its children in a persistent client provider mounted once. This provider retains the unread notification count and pending optimistic states across internal navigation without remounting.
- Post management actions (publish, unpublish, delete) and bookmark saving run through `useOptimistic` inside `useTransition`. The user interface updates immediately, and React rolls back the change if the Server Action fails.
- Directional `<ViewTransition>` runs between `/dashboard/posts` and `/dashboard/posts/[id]/edit`, scoped strictly to the content area. The sidebar navigation and notification badge remain outside the transition scope.
- No API layer sits between the app and the database. A shared data-access module of plain async Drizzle query functions is called directly by Server Components for reads and by Server Actions for writes; every Server Action checks the session and, where relevant, resource ownership as its first steps.
- Notifications preload through a `getNotifications` Server Action called server-side, passed to the client through `HydrationBoundary`. The client component consumes the same query key with `useSuspenseQuery`, calling `getNotifications` again as the `queryFn` to poll every 10 to 15 seconds. Marking a notification read calls the `markNotificationRead` Server Action as `useMutation`'s `mutationFn`, invalidating the query on success.

## Out of scope

The following capabilities are explicitly out of scope for this release:

- No downvotes on posts or comments.
- No nested comment trees beyond one level of depth.
- No multiple tags per post.
- No custom labels, folders, or public visibility for saved posts.
- No direct database file storage or internal image hosting pipelines. Header images must reference valid external URLs.
- No direct messaging, private chat, or user-to-user mentions.
- No administrative moderation consoles, user reporting flows, or automated spam filtering.
- No websockets or server-sent events.
- No separate API layer or SDK client; all data access runs through the shared Drizzle module, called directly by Server Components and Server Actions.
- Search (full-text or fuzzy trigram) is deferred to V2.

## Further notes

- Next.js 16.3 requires `cacheComponents: true` and `partialPrefetching: true` flags in `next.config.ts`.
- Domain terms and architectural constraints must strictly follow [`docs/glossary.md`](file:///Users/mx/Code/projects/beacon/docs/glossary.md) and [`docs/adr/0001-core-architecture-and-scope.md`](file:///Users/mx/Code/projects/beacon/docs/adr/0001-core-architecture-and-scope.md).
