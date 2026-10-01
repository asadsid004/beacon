import { ArrowUp02Icon, Comment01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface ShowcasePost {
  readonly id: string;
  readonly title: string;
  readonly domain?: string;
  readonly points: number;
  readonly comments: number;
  readonly tag: string;
  readonly age: string;
}

const SHOWCASE_POSTS: readonly ShowcasePost[] = [
  {
    id: "1",
    title: "Why we moved our job queue from Redis to Postgres",
    domain: "notes.example.dev",
    points: 412,
    comments: 138,
    tag: "postgres",
    age: "3h",
  },
  {
    id: "2",
    title: "A field guide to React Server Components caching",
    domain: "blog.example.io",
    points: 286,
    comments: 74,
    tag: "react",
    age: "5h",
  },
  {
    id: "3",
    title: "I replaced my homelab with a single VPS",
    domain: "hosting.example.net",
    points: 198,
    comments: 91,
    tag: "selfhosting",
    age: "8h",
  },
  {
    id: "4",
    title: "What actually happens during a TLS handshake",
    domain: "learn.example.org",
    points: 154,
    comments: 33,
    tag: "security",
    age: "11h",
  },
  {
    id: "5",
    title: "Ask Beacon: what are you building this month?",
    points: 107,
    comments: 210,
    tag: "discussion",
    age: "14h",
  },
  {
    id: "6",
    title: "Designing zero-dependency UI primitives in TypeScript",
    domain: "ui.example.com",
    points: 101,
    comments: 59,
    tag: "typescript",
    age: "16h",
  },
  {
    id: "7",
    title: "SQLite on NVMe: benchmarks and surprises",
    domain: "storage.example.org",
    points: 97,
    comments: 142,
    tag: "database",
    age: "19h",
  },
  {
    id: "8",
    title: "Show Beacon: A minimal Hacker News reader for e-ink",
    domain: "tools.example.dev",
    points: 94,
    comments: 88,
    tag: "show",
    age: "1d",
  },
  {
    id: "9",
    title: "How Linux cgroups v2 actually manage memory",
    domain: "kernel.example.net",
    points: 83,
    comments: 64,
    tag: "linux",
    age: "1d",
  },
  {
    id: "10",
    title: "A visual breakdown of Raft consensus edge cases",
    domain: "systems.example.io",
    points: 75,
    comments: 103,
    tag: "distributed",
    age: "2d",
  },
] as const;

export const AuthShowcasePanel = () => (
  <div
    aria-hidden="true"
    inert
    className="border-primary bg-auth-showcase relative flex h-full w-full flex-col overflow-hidden rounded-3xl border p-12 pr-0 shadow-sm select-none"
  >
    <div className="shrink-0">
      {/* oxlint-disable-next-line shadcn/no-arbitrary-values */}
      <h2 className="font-heading text-primary-foreground text-[clamp(2rem,4vw,4rem)] leading-tight font-semibold tracking-tight">
        <span className="block">Read a thread.</span>
        <span className="block">Share a thought.</span>
      </h2>
    </div>

    <div className="mt-10 flex shrink-0 flex-col gap-4">
      {SHOWCASE_POSTS.map((post) => (
        <article
          key={post.id}
          className="border-border/80 bg-card text-card-foreground flex w-[calc(100%+3rem)] shrink-0 items-center gap-4 rounded-2xl border p-4 shadow-lg shadow-black/15 transition-transform 2xl:gap-5 2xl:p-5 dark:border-white/10 dark:shadow-none"
        >
          <div className="bg-muted/70 flex h-13 w-13 shrink-0 flex-col items-center justify-center rounded-xl 2xl:h-16 2xl:w-16 2xl:rounded-2xl">
            <HugeiconsIcon
              icon={ArrowUp02Icon}
              size={18}
              strokeWidth={2}
              className="text-primary 2xl:size-5"
            />
            <span className="text-foreground font-mono text-sm font-bold 2xl:text-base">
              {post.points}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-card-foreground truncate text-base font-semibold tracking-tight 2xl:text-lg">
                {post.title}
              </span>
              {post.domain ? (
                <span className="text-muted-foreground/80 shrink-0 text-xs 2xl:text-sm">
                  ({post.domain})
                </span>
              ) : null}
            </div>

            <div className="text-muted-foreground mt-1.5 flex items-center gap-2.5 text-xs 2xl:text-sm">
              <span className="bg-secondary text-secondary-foreground rounded-md px-2 py-0.5 font-medium">
                {post.tag}
              </span>
              <span>&middot;</span>
              <span>{post.age}</span>
              <span>&middot;</span>
              <span className="inline-flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={Comment01Icon}
                  size={13}
                  className="shrink-0 2xl:size-4"
                />
                <span>{post.comments} comments</span>
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  </div>
);
