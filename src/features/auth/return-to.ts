const DASHBOARD_PATH = "/dashboard";
const DASHBOARD_PREFIX = `${DASHBOARD_PATH}/`;

const hasTraversalSegment = (pathname: string): boolean =>
  pathname.split("/").some((segment) => segment === "." || segment === "..");

export const getSafeReturnTo = (value: string | null | undefined): string => {
  if (!value) {
    return DASHBOARD_PATH;
  }

  const withoutFragment = value.trim().split("#", 1)[0] ?? "";
  const queryIndex = withoutFragment.indexOf("?");
  const pathname =
    queryIndex === -1 ? withoutFragment : withoutFragment.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : withoutFragment.slice(queryIndex);

  if (
    !pathname.startsWith("/") ||
    pathname.startsWith("//") ||
    pathname.includes("\\") ||
    hasTraversalSegment(pathname)
  ) {
    return DASHBOARD_PATH;
  }

  if (pathname !== DASHBOARD_PATH && !pathname.startsWith(DASHBOARD_PREFIX)) {
    return DASHBOARD_PATH;
  }

  return `${pathname}${query}`;
};
