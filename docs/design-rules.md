# Design and layout rules

This file owns layout, tokens, viewports, and motion. [PRD](PRD.md) owns product rules, [ROADMAP](ROADMAP.md) owns build order, and [AGENTS](../AGENTS.md) owns fonts and agent workflow.

## Application shell architecture

One frame spans all routes. Top navbar and outer container stay in the same position on public and dashboard pages, so transitions produce zero layout shift.

### Universal top navigation bar

Root layout at `src/app/layout.tsx` renders the bar on every route.

- Height fixed at 56 pixels with bottom border using `border-b border-border`.
- Left holds Beacon logo plus public filters Hot, New, Top, Tags.
- Right holds bell with count badge, `+ New post` button, karma in the [AGENTS metadata font](../AGENTS.md#agent-notes), and avatar menu. Anonymous visitors see Sign in and Sign up.
- The session-aware user slot sits inside Suspense. It shows karma and avatar after resolving; unresolved state uses a neutral placeholder. [ROADMAP](ROADMAP.md#implementation-phases) owns when the navbar, bell, and New post destination ship.
- Bar stays mounted during client navigation.

### Page container boundary

Every route wraps main content in one shared container.

- Width caps at `max-w-5xl` centered with `mx-auto`.
- Horizontal padding `px-4 sm:px-6`.
- Never expand past `max-w-5xl` on ultrawide. Scale down smoothly with no clipping.

## Layout modes

### Public feed layout

Single focused column inside the shared container for `/`, `/t/[tag]`, and `/p/[id]`. No sidebars or right rails.

```text
+-------------------------------------------------------------+
| [Beacon]  Hot  New  Top  Tags       |  (Bell)  + New post   |
+-------------------------------------------------------------+
| [                max-w-5xl container                        ] |
| +---------------------------------------------------------+ |
| | Title row with stretched link behavior per PRD          | |
| | score by author, time, comments, [tag]                  | |
| +---------------------------------------------------------+ |
+-------------------------------------------------------------+
```

Feed card links and controls follow [PRD section 4](PRD.md#4-feed-card-and-form-rules). Visitor islands follow the [cache matrix](PRD.md#6-route-caching-and-invalidation-matrix).

### Dashboard layout

`src/app/dashboard/layout.tsx` mounts inside the root frame. Container splits into two columns.

- Left sidebar fixed `w-56`. Lists Overview, Posts, Saved, Notifications, Settings. Stays mounted across dashboard navigation.
- Main pane uses `flex-1 min-w-0` for lists and forms. Its width is the container's inner width minus sidebar and gap; do not assume a fixed 760 pixels.
- Mobile under 1024 pixels. Sidebar becomes a horizontal tab bar pinned above content. No slide out sheet. One pattern only.

```text
+-------------------------------------------------------------+
| [Beacon]  Hot  New  Top  Tags       |  (Bell)  + New post   |
+-------------------------------------------------------------+
| [                max-w-5xl container                        ] |
| +-------------+  +----------------------------------------+ |
| | DASHBOARD   |  | Posts                     [+ New post] | |
| | Overview    |  | [All]  [Published]  [Drafts]           | |
| | Posts       |  | Row per PRD lifecycle                  | |
| | Saved       |  |                                        | |
| | Notifs      |  |                                        | |
| | Settings    |  |                                        | |
| +-------------+  +----------------------------------------+ |
+-------------------------------------------------------------+
```

## Viewport testing requirements

This is the full viewport matrix. [AGENTS](../AGENTS.md#layout-and-responsiveness) links here for the task checklist.

1. Mobile 375 to 430.
2. Tablet 768 to 1024.
3. Laptop 1280, 1366, 1440, and 1512. This range breaks fixed widths, desktop nav, and font scales most often.
4. Large desktop 1920 and wider.

Check heading sizes and line heights at 1366 and 1440. Titles must not wrap to single word lines on laptop widths.

## Core layout rules

### Fluid container scaling

Boundaries cap at `max-w-5xl` with fluid padding. Dashboard never exceeds the cap.

### Zero horizontal page scroll

Body never shows horizontal scroll at any width. Code blocks and tables use local `overflow-x-auto`.

### Media boundaries

All images, videos, and embeds use `max-width 100%` and `height auto`. Header images use the rendering and fallback contract in [PRD section 4](PRD.md#4-feed-card-and-form-rules).

## Color system and tokens

Orange brand accent over neutral backgrounds, configured through shadcn semantic variables in `src/app/globals.css`.

### Brand primary

- Light mode `oklch(0.553 0.195 38.402)`.
- Dark mode `oklch(0.47 0.157 37.304)`.
- Use `bg-primary`, `text-primary-foreground`, and `text-primary` for primary actions, active votes, active tabs, and brand accents. Never hardcode hex or `bg-orange-500`.

### Neutral surfaces and text

- Cards and containers use `bg-card` with `border-border`.
- Primary copy uses `text-foreground`.
- Metadata, dates, and author names use `text-muted-foreground`.
- Hover states use `hover:bg-accent hover:text-accent-foreground`.

### Agent rule for styling

Never hardcode black buttons or custom hex values. Always reference semantic tokens so light and dark modes resolve automatically.

## Animation and transition standards

The following page transitions are allowed in V1. [ROADMAP Phase 7](ROADMAP.md#phase-7-view-transitions) owns implementation timing for all of them. Before that phase, Suspense reveals use skeletons without Crossfade. Micro-interaction exceptions are listed below.

1. Suspense reveal crossfade. The shared custom `<Crossfade>` wrapper in `src/components/crossfade.tsx` wraps React `<ViewTransition>` around public body and comment reveals. This is project code, not a Next.js export. Import it from `@/components/crossfade`.
2. Feed reflow on rank change. `<ViewTransition>` around score driven reorder so rows do not jump.
3. Directional dashboard transition between `/dashboard/posts` and edit form, scoped to content pane only. Sidebar and badge stay outside.

### Blur reveal values

Streaming reveals use a soft blur fade.

- Enter from `opacity` 0, `blur(8px)`, `translateY(6px)` to normal over 220 to 300ms with `cubic-bezier(0.16, 1, 0.3, 1)`.
- Exit to `opacity` 0, `blur(6px)`, `translateY(-4px)` over 120 to 160ms with the same curve.
- External CSS transitions apply only to micro interactions such as badge pops, dropdowns, and tooltips.

### Accessibility for motion and controls

- Card anchors follow [PRD section 4](PRD.md#4-feed-card-and-form-rules). Their stretch and raised hit areas must preserve distinct accessible names and keyboard focus.
- Keyboard focus is visible on cards, links, and buttons with standard focus rings. Never remove outlines without a replacement.
- Vote buttons use `aria-pressed` for active state.
- Honor `prefers-reduced-motion` by disabling blur and slide transitions.
