# ADR 0002: store score and karma counters

## Status

Accepted.

## Context and decision

Feed ranking needs scores without grouping votes on every read, and profiles need karma without aggregating all received votes. Counting on demand avoids stored-counter drift but adds work to the busiest read paths. Keeping score alone would still require a separate profile aggregate.

Store score and karma counters and maintain them in vote transactions. The [PRD schema](../PRD.md#2-data-architecture-and-schema-contracts), [lifecycle rows L9 to L11 and L17](../PRD.md#lifecycle-matrix), and [shared transaction contract](../PRD.md#shared-transaction-and-lock-order) own the operative rules.

## Consequences

Reads avoid vote aggregation. Writes must serialize targets and maintain counters together. Historical karma survives content deletion, so production karma cannot be reconstructed from current live scores. The [phase-aware seed contract](../PRD.md#seed-contract-and-named-fixtures) describes synthetic fixtures before votes exist and actual vote-backed fixtures afterward. Verification uses the [PRD counter queries](../PRD.md#counter-verification).
