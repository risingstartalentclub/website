const emailPattern =
  /^[a-z0-9](?:[a-z0-9._%+-]*[a-z0-9])?@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/;

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function emailError(value: string) {
  const email = normalizeEmail(value);
  if (!email) return "Enter an email address.";
  if (email.length < 5 || email.length > 160 || email.includes("..")) {
    return "Enter a valid email address, like maya@example.com.";
  }
  if (!emailPattern.test(email)) {
    return "Enter a valid email address, like maya@example.com.";
  }
  const domain = email.slice(email.lastIndexOf(".") + 1);
  if (domain.length < 2) {
    return "Enter a valid email address, like maya@example.com.";
  }
  return null;
}

export function normalizeMobile(value: string) {
  let digits = value.trim().replace(/[^\d]/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

export function mobileError(value: string) {
  const raw = value.trim();
  if (!raw) return "Enter a mobile number.";
  if (/[a-z]/i.test(raw)) return "Enter a 10-digit mobile number.";
  const digits = normalizeMobile(raw);
  if (!/^[6-9]\d{9}$/.test(digits)) {
    return "Enter a 10-digit mobile number starting with 6, 7, 8, or 9.";
  }
  return null;
}

export function passwordError(value: string, mode: "login" | "signup") {
  if (!value) return "Enter a password.";
  if (value.length > 72) return "Use a password of 72 characters or fewer.";
  if (mode === "login") return null;
  if (value.length < 8 || !/[a-z]/i.test(value) || !/[0-9]/.test(value)) {
    return "Use at least 8 characters, including one letter and one number.";
  }
  return null;
}
