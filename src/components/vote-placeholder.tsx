import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";

const numberFormat = new Intl.NumberFormat("en-US");
const compactNumberFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const VotePlaceholder = ({
  score,
  label,
  visitor,
}: {
  score: number;
  label: string;
  visitor?: "pending" | "anonymous" | "authenticated";
}) => (
  <Button
    variant="vote"
    size="vote"
    disabled
    aria-pressed={false}
    data-visitor-state={visitor}
    title={`${numberFormat.format(score)} upvotes`}
    aria-label={`Upvote ${label}, score ${numberFormat.format(score)}, available in a later release`}
  >
    <HugeiconsIcon
      icon={ArrowUp01Icon}
      strokeWidth={2}
      className="size-5"
      aria-hidden="true"
    />
    <span className="font-mono text-xs tabular-nums">
      {compactNumberFormat.format(score)}
    </span>
  </Button>
);
