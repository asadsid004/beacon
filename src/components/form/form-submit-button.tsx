"use client";

import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useFormContext } from "./form-context";

export interface FormSubmitButtonProps {
  children: ReactNode;
  className?: string;
  showArrow?: boolean;
}

export const FormSubmitButton = ({
  children,
  className,
  showArrow = true,
}: FormSubmitButtonProps) => {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button
          type="submit"
          size="xl"
          disabled={!canSubmit || Boolean(isSubmitting)}
          className={cn("w-full", className)}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span>Please wait...</span>
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-1.5">
              <span>{children}</span>
              {showArrow ? (
                <HugeiconsIcon
                  icon={ArrowRight02Icon}
                  size={16}
                  strokeWidth={2}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              ) : null}
            </span>
          )}
        </Button>
      )}
    </form.Subscribe>
  );
};
