export const NAME_MIN_LENGTH = 3;
export const NAME_MAX_LENGTH = 80;
export const PHONE_MIN_LENGTH = 8;
export const PHONE_MAX_LENGTH = 20;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;
export const UNIT_MAX_LENGTH = 20;
export const CATEGORY_MAX_LENGTH = 50;
export const DESCRIPTION_MAX_LENGTH = 280;

export const PHONE_PATTERN = "^[0-9()+\\-\\s]{8,20}$";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9()+\-\s]{8,20}$/;

export function hasLengthInRange(value: string, min: number, max: number) {
  const trimmed = value.trim();
  return trimmed.length >= min && trimmed.length <= max;
}

export function isValidEmail(value: string) {
  return emailRegex.test(value.trim());
}

export function isValidPhone(value: string) {
  return phoneRegex.test(value.trim());
}
