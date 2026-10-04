# ADR 0003: hot and top ordering

## Status

Accepted.

## Context and decision

Sorting by draft creation time misorders posts published later. The previous hot formula kept zero-score posts at zero and tied fresh posts under its age clamp. A time-windowed top sort would require another product choice and more cache keys.

Use first publication time for new, an all-time top sort, and a hot formula that gives new zero-score posts a nonzero rank. The exact formula, defaults, ordering directions, and worked fixture example live in [PRD section 4](../PRD.md#4-feed-card-and-form-rules). Timestamp transitions live in [lifecycle row L18](../PRD.md#lifecycle-matrix).

## Consequences

Draft preparation does not penalize new-feed placement. Hot ordering changes as time passes, so its cache lifetime differs from new/top in the [PRD cache matrix](../PRD.md#6-route-caching-and-invalidation-matrix). The [seed fixtures](../PRD.md#seed-contract-and-named-fixtures) exercise age, score, and ties.
