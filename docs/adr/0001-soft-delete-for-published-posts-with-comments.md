# ADR 1: Soft delete for published posts with comments

## Status

Accepted

## Context

A published post with an active comment thread needs a deletion path that doesn't orphan the discussion other users contributed to. Hard-deleting the row would remove or orphan the comments; hiding the whole thread loses reader history for no benefit over letting the author's content be replaced instead.

## Alternatives considered

- **Always hard-delete.** Simplest, but destroys the comment thread along with the post.
- **Cascade-delete comments with the post.** Removes other users' contributions to satisfy one author's deletion, not acceptable.
- **Lock the thread in place, keep the original body.** Avoids new schema, but leaves the author's actual content visible indefinitely against their wishes.

## Decision

- Deleting a post with `commentCount` of zero hard-deletes the row.
- Deleting a post with `commentCount` greater than zero soft-deletes it instead: sets `deletedAt`, nulls `authorId`, clears `headerImageUrl`, and replaces `body` with the fixed string "This post was deleted by the author." `title`, `url`, `tag`, `score`, and `commentCount` are left untouched.
- A soft-deleted post accepts no further votes, comments, or edits, and is excluded from feed, tag, and profile queries via `deletedAt IS NULL`, though the direct `/p/[id]` link still resolves with the full comment tree intact.
- Author karma earned from votes on a deleted post is not retracted.

## Consequences

- `posts.authorId` and `posts.headerImageUrl` must be nullable; `posts` gains a nullable `deletedAt` timestamp.
- Every feed, tag, and profile query needs an explicit `deletedAt IS NULL` filter, since post `status` alone doesn't express this state.
- The delete Server Action must capture the author's username before nulling `authorId`, since cache invalidation for `profile-{authorUsername}` still needs it afterward.
