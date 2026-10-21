import { VotePlaceholder } from "@/components/vote-placeholder";
import type { getCurrentUser } from "@/features/auth/queries";

export const VisitorVote = async ({
  visitor,
  score,
  label,
}: {
  visitor: ReturnType<typeof getCurrentUser>;
  score: number;
  label: string;
}) => {
  const user = await visitor;
  // Vote and saved-state reads arrive in Phase 4. Both visitors stay neutral here.
  return (
    <VotePlaceholder
      score={score}
      label={label}
      visitor={user ? "authenticated" : "anonymous"}
    />
  );
};
