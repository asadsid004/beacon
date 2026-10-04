# ADR 0001: preserve discussion after post deletion

## Status

Accepted.

## Context and decision

Authors need to remove their content without destroying comments contributed by other users. Always hard-deleting posts or cascading every thread would erase that discussion. Keeping the original author body would fail the author's deletion request.

Use soft deletion for posts with comments and hard deletion when no discussion exists. The operative state transitions, field changes, visibility, and permissions live in [PRD lifecycle rows L1, L2, L7, L8, and L17](../PRD.md#lifecycle-matrix). The transaction order lives in the [PRD mutation contract](../PRD.md#shared-transaction-and-lock-order).

## Consequences

The thread remains addressable while the author's body and attribution are removed. Public reads must distinguish publication from deletion. The [schema](../PRD.md#2-data-architecture-and-schema-contracts) and [cache refresh matrix](../PRD.md#mutation-refresh-targets) carry the resulting requirements.
