const relativeFormat = new Intl.RelativeTimeFormat("en-US", {
  numeric: "always",
});
const absoluteFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  year: "numeric",
  month: "short",
  day: "numeric",
});

export const formatPostDate = (date: Date, now = Date.now()) => {
  const seconds = Math.max(0, (now - date.getTime()) / 1000);
  if (seconds < 60) {
    return "just now";
  }
  if (seconds < 3600) {
    return relativeFormat.format(-Math.floor(seconds / 60), "minute");
  }
  if (seconds < 86_400) {
    return relativeFormat.format(-Math.floor(seconds / 3600), "hour");
  }
  if (seconds < 604_800) {
    return relativeFormat.format(-Math.floor(seconds / 86_400), "day");
  }
  return absoluteFormat.format(date);
};
