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

export function passwordError(value: string, mode: "login" | "signup") {
  if (!value) return "Enter a password.";
  if (value.length > 72) return "Use a password of 72 characters or fewer.";
  if (mode === "login") return null;
  if (value.length < 8 || !/[a-z]/i.test(value) || !/[0-9]/.test(value)) {
    return "Use at least 8 characters, including one letter and one number.";
  }
  return null;
}
