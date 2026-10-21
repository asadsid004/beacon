import Link from "next/link";

import { Button } from "@/components/ui/button";

export const Pagination = ({
  previousHref,
  nextHref,
}: {
  previousHref?: string;
  nextHref?: string;
}) => {
  if (!previousHref && !nextHref) {
    return null;
  }
  return (
    <nav
      aria-label="Pagination"
      className="mt-6 flex items-center justify-between gap-4"
    >
      {previousHref ? (
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          {...{ role: "link" }}
          render={<Link href={previousHref} rel="prev" />}
        >
          Previous
        </Button>
      ) : (
        <span />
      )}
      {nextHref && (
        <Button
          variant="outline"
          size="lg"
          nativeButton={false}
          {...{ role: "link" }}

          render={<Link href={nextHref} rel="next" />}
        >
          Next
        </Button>
      )}
    </nav>
  );
};
