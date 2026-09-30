"use client";

import { createFormHookContexts } from "@tanstack/react-form";
import { z } from "zod";

export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

export const errorDisplaySchema = z.union([
  z.string(),
  z.object({ message: z.string() }).transform((val) => val.message),
]);
