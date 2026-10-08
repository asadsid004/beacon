import Link from "next/link";

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
        <Link
          href={previousHref}
          rel="prev"
          className="hover:bg-accent focus-visible:ring-ring rounded-md border px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Previous
        </Link>
      ) : (
        <span />
      )}
      {nextHref && (
        <Link
          href={nextHref}
          rel="next"
          className="hover:bg-accent focus-visible:ring-ring rounded-md border px-4 py-2 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          Next
        </Link>
      )}
    </nav>
  );
};
