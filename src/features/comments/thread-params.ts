export const getThreadHref = (postId: string, page = 1) => {
  const path = `/p/${postId}`;
  return page > 1 ? `${path}?page=${page}` : path;
};
