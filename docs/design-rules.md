# Design and layout rules

This document defines layout constraints, application shell structure, responsive rules, and animation standards for Beacon.

## Application shell architecture

The interface uses a single frame across all routes. The top navigation bar and outer container boundary stay in the exact same position on both public feeds and authenticated dashboard pages.

### Universal top navigation bar

The root layout (`src/app/layout.tsx`) renders the top navigation bar on every route:

- Height is fixed at 56 pixels (`h-14`) with a bottom border (`border-b border-zinc-200 dark:border-zinc-800`).
- The left section contains the Beacon logo and public feed filters (`Hot`, `New`, `Top`, and `Tags`).
- The right section contains the unread notification bell with count badge, the `+ New post` button, the author karma score in Geist Mono, and the user avatar menu. For anonymous visitors, it displays `Sign in` and `Sign up` buttons.
- The navigation bar stays mounted and stationary during client-side navigation.

### Page container boundary

Every route wraps its main content in a shared container:

- Width caps at `max-w-5xl` (1024 pixels) centered with `mx-auto`.
- Horizontal padding uses `px-4 sm:px-6`.
- Because the outer boundary is identical on public and dashboard pages, page transitions produce zero layout shift.

---

## Layout modes

### Public feed layout (`/`, `/t/[tag]`, `/p/[id]`)

The public feed renders as a single focused reading column directly within the `max-w-5xl` container. It avoids secondary sidebars or right-rail widgets, keeping attention on links, titles, tags, and comment threads.

```text
+-------------------------------------------------------------+
| [Beacon]  Hot  New  Top  Tags       |  (Bell)  + New post   |  <- Universal navbar (h-14)
+-------------------------------------------------------------+
|                                                             |
| [                max-w-5xl container (1024px)              ] |
|                                                             |
| +---------------------------------------------------------+ |
| | ^  Show HN: A clean Next.js discussion aggregator       | |  <- Single column post card
| | 34  by mx, 2 hours ago, 14 comments, [nextjs]           | |
| +---------------------------------------------------------+ |
| | ^  Drizzle ORM release notes                            | |
| | 89  by alex, 5 hours ago, 42 comments, [databases]      | |
| +---------------------------------------------------------+ |
|                                                             |
+-------------------------------------------------------------+
```

### Dashboard layout (`/dashboard/*`)

The dashboard layout (`src/app/dashboard/layout.tsx`) mounts inside the same root frame. Below the universal top navbar, the `max-w-5xl` container divides into a two-column shell:

- **Left navigation sidebar:** Uses a fixed width of `w-56` (224 pixels). It lists dashboard sections (`Overview`, `Posts`, `Saved`, `Notifications`, `Settings`). It stays mounted during navigation between dashboard sub-routes.
- **Main content pane:** Uses the remaining space (`flex-1`, roughly 760 pixels). It renders post lists, post creation forms, bookmark collections, and settings panels.
- **Mobile and tablet viewports:** On screens narrower than 1024 pixels, the sidebar collapses into a horizontal tab bar or a slide-out sheet.

```text
+-------------------------------------------------------------+
| [Beacon]  Hot  New  Top  Tags       |  (Bell)  + New post   |  <- Universal navbar stays identical
+-------------------------------------------------------------+
|                                                             |
| [                max-w-5xl container (1024px)              ] |
|                                                             |
| +-------------+  +----------------------------------------+ |
| | DASHBOARD   |  | Posts                     [+ New post] | |
| |             |  |                                        | |
| | · Overview  |  | [All]  [Published]  [Drafts]           | |
| | · Posts     |  +----------------------------------------+ |
| | · Saved     |  | Build an aggregator with Next.js 16.3  | |
| | · Settings  |  | Published, 14 comments, 34 upvotes     | |
| +-------------+  +----------------------------------------+ |
|  w-56 (224px)             Content pane (~760px)             |
+-------------------------------------------------------------+
```

---

## Viewport testing requirements

Test all pages across four viewports in browser developer tools:

1. Mobile: 375 to 430 pixels.
2. Tablet: 768 to 1024 pixels.
3. Laptop range: 1280, 1366, 1440, and 1512 pixels.
4. Large desktop: 1920 pixels and wider.

Do not stop testing at mobile and wide desktop. The laptop range between 1280 and 1512 pixels is where fixed container widths, desktop navigation, and font scales break.

---

## Core layout rules

### 1. Fluid container scaling
- Container boundaries cap at `max-w-5xl` (1024 pixels) with fluid horizontal padding (`px-4 sm:px-6`).
- Containers must scale down smoothly on narrower screens without clipping borders or text.
- The dashboard container must never expand past `max-w-5xl` into ultrawide viewports.

### 2. Zero horizontal page scroll
- The document body must never display a horizontal scrollbar at any viewport width.
- Code blocks and data tables must use local `overflow-x-auto` to isolate wide content.

### 3. Media boundaries
- Apply `max-width: 100%` and `height: auto` to all images, videos, and embedded media.
- Header images render to the full width of their container without causing page overflow.

### 4. Mid-range typography check
- Check heading font sizes and line heights at 1366 and 1440 pixel widths.
- Ensure titles scale cleanly on laptop viewports without single-word line wraps.

---

## Animation and transition standards

### 1. Blur reveal transitions
Page navigations and streaming component reveals use a soft blur fade:

- Entrance keyframes: `opacity` from 0 to 1, `filter: blur(8px)` to `blur(0px)`, and `transform: translateY(6px)` to `translateY(0)`.
- Exit keyframes: `opacity` from 1 to 0, `filter: blur(0px)` to `blur(6px)`, and `transform: translateY(0)` to `translateY(-4px)`.
- Timing: 120ms to 160ms for exit, 220ms to 300ms for entrance, using `cubic-bezier(0.16, 1, 0.3, 1)`.

### 2. View transition boundaries
- Route transitions and streaming reveals run through React View Transitions.
- External CSS transitions apply only to isolated micro-interactions, such as notification badge pops, dropdown reveals, and tooltip displays.
