export const FEED_SORTS = ["hot", "new", "top"] as const;
export type FeedSort = (typeof FEED_SORTS)[number];

export const parseFeedSort = (
  value: string | string[] | undefined
): FeedSort => {
  if (value === "new" || value === "top") {
    return value;
  }
  return "hot";
};

export const getFeedHref = ({
  sort = "hot",
  page = 1,
  tag,
}: { sort?: FeedSort; page?: number; tag?: string } = {}) => {
  const params = new URLSearchParams();
  if (!tag && sort !== "hot") {
    params.set("sort", sort);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const path = tag ? `/t/${encodeURIComponent(tag)}` : "/";
  const query = params.toString();
  return query ? `${path}?${query}` : path;
};
