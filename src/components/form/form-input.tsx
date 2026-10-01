"use client";

import { Input } from "@/components/ui/input";
import type { InputProps } from "@/components/ui/input";

import { FormFieldError, useFieldError } from "./form-field-error";

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
  const { field, isInvalid, firstError } = useFieldError<string>();

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
      <FormFieldError error={firstError} />
    </div>
  );
};
