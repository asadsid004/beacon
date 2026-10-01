"use client";

import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

import { Input } from "@/components/ui/input";

import { FormFieldError, useFieldError } from "./form-field-error";
import type { FormInputProps } from "./form-input";

export const FormPasswordInput = ({ className, ...props }: FormInputProps) => {
  const { field, isInvalid, firstError } = useFieldError<string>();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          name={field.name}
          value={field.state.value ?? ""}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          endAdornment
          className={className}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((prev) => !prev)}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer transition-colors"
        >
          <HugeiconsIcon
            icon={showPassword ? ViewOffSlashIcon : ViewIcon}
            size={18}
            strokeWidth={2}
            className="shrink-0"
          />
        </button>
      </div>
      <FormFieldError error={firstError} />
    </div>
  );
};
