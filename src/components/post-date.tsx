import { formatPostDate } from "@/lib/post-date";

export const PostDate = ({ date }: { date: Date }) => {
  const iso = date.toISOString();
  return (
    <time dateTime={iso} title={iso}>
      {formatPostDate(date)}
    </time>
  );
};
