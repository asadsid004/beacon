"use client";

import { z } from "zod";

import { useFieldContext } from "./form-context";

const errorDisplaySchema = z.union([
  z.string(),
  z.object({ message: z.string() }).transform((val) => val.message),
]);

export const useFieldError = <T = string,>() => {
  const field = useFieldContext<T>();
  const isInvalid =
    Boolean(field.state.meta.isTouched) && field.state.meta.errors.length > 0;
  const firstError = isInvalid
    ? (errorDisplaySchema.safeParse(field.state.meta.errors[0]).data ?? null)
    : null;

  return {
    field,
    isInvalid,
    firstError,
  };
};

export interface FormFieldErrorProps {
  error?: string | null;
}

export const FormFieldError = ({ error }: FormFieldErrorProps) => {
  if (!error) {
    return null;
  }

  return <p className="text-destructive mt-1.5 text-xs font-medium">{error}</p>;
};
