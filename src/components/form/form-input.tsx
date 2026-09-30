"use client";

import { Input } from "@/components/ui/input";
import type { InputProps } from "@/components/ui/input";

import { errorDisplaySchema, useFieldContext } from "./form-context";

export interface FormInputProps extends Omit<
  InputProps,
  "value" | "defaultValue" | "onChange" | "onBlur"
> {
  autoLowercase?: boolean;
}

export const FormInput = ({
  autoLowercase = false,
  className,
  ...props
}: FormInputProps) => {
  const field = useFieldContext<string>();
  const isInvalid =
    Boolean(field.state.meta.isTouched) && field.state.meta.errors.length > 0;
  const firstError = isInvalid
    ? (errorDisplaySchema.safeParse(field.state.meta.errors[0]).data ?? null)
    : null;

  return (
    <div className="w-full">
      <Input
        name={field.name}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => {
          const val = autoLowercase
            ? e.target.value.toLowerCase().trim()
            : e.target.value;
          field.handleChange(val);
        }}
        aria-invalid={isInvalid}
        className={className}
        {...props}
      />
      {firstError ? (
        <p className="text-destructive mt-1.5 text-xs font-medium">
          {firstError}
        </p>
      ) : null}
    </div>
  );
};
