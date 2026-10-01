import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "border-input text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 h-11 w-full rounded-xl border bg-transparent px-3.5 text-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      endAdornment: {
        true: "pr-10",
      },
    },
  }
);

export type InputProps = ComponentProps<typeof InputPrimitive> &
  VariantProps<typeof inputVariants>;

export const Input = ({ className, endAdornment, ...props }: InputProps) => (
  <InputPrimitive
    data-slot="input"
    className={cn(inputVariants({ endAdornment, className }))}
    {...props}
  />
);
