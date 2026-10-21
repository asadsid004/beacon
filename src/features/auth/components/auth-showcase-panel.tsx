import {
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  Comment03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

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
    title: "How we cut database costs without slowing queries",
    domain: "notes.example.dev",
    points: 412,
    comments: 138,
    tag: "postgres",
    age: "3 hours ago",
  },
  {
    id: "2",
    title: "A practical guide to caching in Next.js",
    domain: "blog.example.io",
    points: 286,
    comments: 74,
    tag: "react",
    age: "5 hours ago",
  },
  {
    id: "3",
    title: "Running AI-generated code in isolated sandboxes",
    domain: "projects.example.net",
    points: 198,
    comments: 91,
    tag: "ai",
    age: "8 hours ago",
  },
  {
    id: "4",
    title: "What a TLS handshake looks like, step by step",
    domain: "learn.example.org",
    points: 154,
    comments: 33,
    tag: "security",
    age: "11 hours ago",
  },
  {
    id: "5",
    title: "What happens when a cloud agent loses its connection?",
    points: 107,
    comments: 210,
    tag: "agents",
    age: "14 hours ago",
  },
  {
    id: "6",
    title: "Building accessible menus without a UI framework",
    domain: "ui.example.com",
    points: 101,
    comments: 59,
    tag: "typescript",
    age: "16 hours ago",
  },
  {
    id: "7",
    title: "When SQLite is enough for a production app",
    domain: "storage.example.org",
    points: 97,
    comments: 142,
    tag: "database",
    age: "19 hours ago",
  },
  {
    id: "8",
    title: "Choosing between containers and microVMs in the cloud",
    domain: "tools.example.dev",
    points: 94,
    comments: 88,
    tag: "cloud",
    age: "1 day ago",
  },
  {
    id: "9",
    title: "Debugging a memory leak in a small Linux server",
    domain: "kernel.example.net",
    points: 83,
    comments: 64,
    tag: "linux",
    age: "1 day ago",
  },
  {
    id: "10",
    title: "What we learned from our first production outage",
    domain: "systems.example.io",
    points: 75,
    comments: 103,
    tag: "engineering",
    age: "2 days ago",
  },
] as const;

export const AuthShowcasePanel = () => (
  <div
    aria-hidden="true"
    inert
    className="border-primary bg-auth-showcase relative flex h-full w-full flex-col overflow-hidden rounded-3xl border p-12 pr-0 shadow-sm select-none"
  >
    <div className="shrink-0">
      <h2 className="font-heading text-primary-foreground text-auth-showcase leading-tight font-semibold tracking-tight">
        <span className="block">Read a thread.</span>
        <span className="block">Share a thought.</span>
      </h2>
    </div>

    <div className="bg-background mt-10 shrink-0 rounded-l-2xl p-5 pr-8">
      <div className="space-y-6">
        {SHOWCASE_POSTS.map((post) => (
          <article
            key={post.id}
            className="text-foreground relative -mx-3 flex items-start gap-4 rounded-lg px-3 py-2"
          >
            <div className="flex w-12 shrink-0 flex-col items-center">
              <Button variant="vote" size="vote" disabled>
                <HugeiconsIcon
                  icon={ArrowUp01Icon}
                  strokeWidth={2}
                  className="size-5"
                />
                <span className="font-mono text-xs tabular-nums">
                  {post.points}
                </span>
              </Button>
            </div>
            <div className="min-w-0 flex-1">
              <div className="leading-normal">
                <span className="text-lg leading-normal font-medium wrap-anywhere">
                  {post.title}
                </span>
                {post.domain && (
                  <span className="text-muted-foreground ml-2 inline-flex max-w-full items-center gap-1 align-baseline text-sm">
                    <span>(</span>
                    <span className="min-w-0 wrap-anywhere">{post.domain}</span>
                    <HugeiconsIcon
                      icon={ArrowUpRight01Icon}
                      size={12}
                      strokeWidth={2}
                      className="shrink-0"
                    />
                    <span>)</span>
                  </span>
                )}
              </div>
              <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm leading-normal">
                <span>by {post.id === "5" ? "sarah" : "alex"}</span>
                <span>{post.age}</span>
                <span className="inline-flex items-center gap-1">
                  <HugeiconsIcon
                    icon={Comment03Icon}
                    size={16}
                    strokeWidth={2}
                  />
                  {post.comments} comments
                </span>
                <span className="bg-muted rounded-md px-2 py-1 text-xs">
                  #{post.tag}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  </div>
);
