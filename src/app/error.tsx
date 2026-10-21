"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

const PageError = ({ retry }: { retry: () => void }) => (
  <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
    <div role="alert">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Unable to load this page
      </h1>
      <p className="text-muted-foreground mt-3 text-sm">
        Try again to reload the page.
      </p>
    </div>
    <div className="mt-6 flex flex-wrap gap-2">
      <Button size="lg" onClick={retry} variant="outline">
        Try again
      </Button>
      <Button
        size="lg"
        variant="ghost"
        nativeButton={false}
        {...{ role: "link" }}
        render={<Link href="/" />}
      >
        Browse posts
      </Button>
    </div>
  </main>
);

export default PageError;
