import { z } from "zod";

export const PAGE_SIZE = 20;

const pageSchema = z
  .string()
  .regex(/^\d+$/u)
  .transform(Number)
  .refine(
    (page) =>
      Number.isSafeInteger(page) &&
      page >= 1 &&
      Number.isSafeInteger((page - 1) * PAGE_SIZE)
  );

export const parsePage = (value: string | string[] | undefined) => {
  const result = pageSchema.safeParse(value);
  return result.success ? result.data : 1;
};
