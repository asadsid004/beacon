export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_REGEX = /^[a-z0-9_-]+$/u;

export const RESERVED_USERNAMES = [
  "beacon",
  "admin",
  "moderator",
  "support",
  "system",
] as const;

export const normalizeUsername = (value: string): string =>
  value.trim().toLowerCase();

export const isReservedUsername = (value: string): boolean => {
  const normalized = normalizeUsername(value);
  return RESERVED_USERNAMES.some((name) => name === normalized);
};

export const isValidUsername = (value: string): boolean =>
  USERNAME_REGEX.test(value);

export const isUsableUsername = (value: string): boolean => {
  const normalized = normalizeUsername(value);
  return (
    normalized.length >= USERNAME_MIN_LENGTH &&
    normalized.length <= USERNAME_MAX_LENGTH &&
    isValidUsername(normalized) &&
    !isReservedUsername(normalized)
  );
};
