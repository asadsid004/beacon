# Domain glossary

This document defines core terms used across Beacon.

### Post
A user submission. A post requires a plain text title and a single tag, with an optional external URL, header image URL, and Markdown body. A post belongs to one author, has a score, and a status (draft or published).

### Draft
A post in draft status. Drafts are private to the author, visible only in the dashboard, and cannot receive votes or comments.

### Tag
A single lowercase text string attached to a post for categorization and feed filtering.

### Comment
A text response attached to a post or to another comment. Comments allow one level of nesting. A reply to a top-level comment is allowed. A reply to a reply is forbidden.

### Vote
An upvote cast by a user on a post or comment. A user can toggle their vote. A second vote removes the vote. Downvotes do not exist.

### Score
The total count of upvotes on a post or comment.

### Karma
The cumulative score of an author, stored on the user record. Votes increment or decrement this number directly in the same transaction.

### Feed
A list of published posts, ordered by a sort algorithm (new, top, or hot).

### Soft delete
A deletion mode applied to posts that already have comments. The server replaces the post body and author with a deleted placeholder while preserving the comment thread and vote counts.

### Unpublish
Reverting a published post back to draft status. Only allowed when a post has zero comments.

### Notification
An alert generated for a user when someone comments on their post or replies to their comment. Upvotes do not create notifications.

### Saved post
A bookmark linking a user to a published post. Stored per user and kept private to the user dashboard.
