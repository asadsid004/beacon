"use client";

import { Button } from "@/components/ui/button";

const PageError = ({ retry }: { retry: () => void }) => (
  <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
    <h1 className="font-heading text-2xl font-semibold tracking-tight">
      Unable to load this page
    </h1>
    <p className="text-muted-foreground mt-3 text-sm">
      Try again to reload the page.
    </p>
    <Button size="lg" onClick={retry} variant="outline" className="mt-6">
      Try again
    </Button>
  </main>
);

export default PageError;
