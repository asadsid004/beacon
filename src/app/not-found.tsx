import Link from "next/link";

const NotFound = () => (
  <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
    <h1 className="font-heading text-2xl font-semibold tracking-tight">
      Page not found
    </h1>
    <p className="text-muted-foreground mt-3 text-sm">
      This page does not exist.
    </p>
    <Link
      href="/"
      className="focus-visible:ring-ring mt-6 inline-block rounded-sm text-sm font-medium underline underline-offset-4 outline-none focus-visible:ring-2"
    >
      Browse posts
    </Link>
  </main>
);

export default NotFound;
