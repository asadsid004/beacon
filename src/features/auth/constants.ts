export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_REGEX = /^[a-z0-9_-]+$/u;

export const isValidUsername = (value: string): boolean =>
  USERNAME_REGEX.test(value);
