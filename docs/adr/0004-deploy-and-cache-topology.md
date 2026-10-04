# ADR 0004: Vercel hosting with a portable container

## Status

Accepted.

## Context and decision

Coolify and Traefik on a VPS would require operations work before the public pages deliver value. Vercel is a simpler initial deployment, but leaving container support unspecified would make a later move harder.

Host V1 on Vercel with Neon and retain a portable container option. Accept per-instance caching for this deployment. The operative hosting/environment contract lives in [PRD section 1](../PRD.md#1-technical-stack-end-state), and the cache topology lives in [PRD section 6](../PRD.md#6-route-caching-and-invalidation-matrix).

## Consequences

V1 requires no Coolify or Traefik setup. A later move to multiple always-on containers needs a shared cache handler and host-specific HTTPS/environment wiring. [ROADMAP](../ROADMAP.md#implementation-phases) owns implementation and release order; its [CI setup](../ROADMAP.md#ci-setup-from-phase-1) defines the isolated test database.
