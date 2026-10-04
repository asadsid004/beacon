# Domain glossary

This file owns Beacon's domain definitions. [PRD](PRD.md) owns product rules, and [ROADMAP](ROADMAP.md) owns build order.

## Language

### Post
A submission authored by a user, with a title and tag. It may also contain an external URL, header image URL, and Markdown body.

### Draft
A post prepared by its author for publication. Its lifecycle and visibility are defined in the [PRD lifecycle matrix](PRD.md#lifecycle-matrix).

### Published post
A post its author has made public. Publication and deletion are distinct concepts in the [PRD lifecycle matrix](PRD.md#lifecycle-matrix).

### Tag
A topic slug attached to a post. Its format is defined in [PRD section 4](PRD.md#4-feed-card-and-form-rules).

### Link post
A post with an external URL.

### Text post
A post without an external URL.

### Title only discussion
A text post without a body.

### Comment
A plain text response to a post.

### Top level comment
A comment that responds directly to a post.

### Reply
A comment that responds to a top level comment. Thread depth is governed by the [PRD lifecycle matrix](PRD.md#lifecycle-matrix).

### Vote
An upvote by a user on a post or comment. Vote permissions are defined in the [PRD lifecycle matrix](PRD.md#lifecycle-matrix).

### Toggle off
Removal of a user's existing vote on a target.

### Score
The number of upvotes on one post or comment. Storage and seed exceptions are defined in [PRD section 2](PRD.md#2-data-architecture-and-schema-contracts).

### Karma
A user's cumulative total from upvotes received, adjusted for votes toggled off. Its treatment after deletion is defined in the [PRD lifecycle matrix](PRD.md#lifecycle-matrix).

### Feed
A public list of posts. Hot, new, and top are feed orderings defined in [PRD section 4](PRD.md#4-feed-card-and-form-rules).

### Soft delete
Removal of an author's content while preserving the post's discussion thread. The retained fields and permissions are defined in the [PRD lifecycle matrix](PRD.md#lifecycle-matrix).

### Unpublish
A transition of a published post back to a draft.

### Notification
An alert about a comment on a user's post or a reply to their comment. Recipients are defined in [PRD section 3](PRD.md#3-post-lifecycle-and-mutation-rules).

### Saved post
A user's private bookmark of a post.

### Visitor
Anyone viewing Beacon, whether signed in or anonymous.

### User
A person with a registered Beacon account. A user may be signed in or signed out.

### Author
The user who created a post or comment. Display after deletion is defined in the [PRD lifecycle matrix](PRD.md#lifecycle-matrix).
