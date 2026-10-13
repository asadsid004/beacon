export const getProfileHref = (username: string, page = 1) => {
  const path = `/u/${encodeURIComponent(username)}`;
  return page > 1 ? `${path}?page=${page}` : path;
};
