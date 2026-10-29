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

export function pincodeError(value: string) {
  const pin = value.trim();
  if (!/^[1-9][0-9]{5}$/.test(pin)) return "Enter a 6-digit PIN code.";
  return null;
}

export function ageError(value: string) {
  const raw = value.trim();
  if (!/^\d{1,2}$/.test(raw)) return "Enter an age from 0 to 21.";
  const age = Number(raw);
  if (age > 21) return "Enter an age from 0 to 21.";
  return null;
}

export function genderError(value: string) {
  if (value !== "boy" && value !== "girl") return "Choose boy or girl.";
  return null;
}

export function instagramError(value: string, required = false) {
  const raw = value.trim();
  if (!raw) {
    return required ? "Enter an Instagram profile link, like https://instagram.com/name." : null;
  }
  try {
    const url = new URL(raw);
    const host = url.hostname.replace(/^www\./, "");
    if (url.protocol !== "https:" || host !== "instagram.com") {
      return "Enter an Instagram profile link, like https://instagram.com/name.";
    }
    return null;
  } catch {
    return "Enter an Instagram profile link, like https://instagram.com/name.";
  }
}

function unsafeText(value: string) {
  return /[<>]/.test(value) || /javascript\s*:/i.test(value);
}

export function contactNameError(value: string) {
  const name = value.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 120) return "Enter your name.";
  if (unsafeText(name)) return "Name cannot include scripts or HTML.";
  if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(name)) return "Use letters in the name.";
  return null;
}

export function contactMessageError(value: string) {
  const message = value.trim();
  if (message.length < 10) return "Write a message of at least 10 characters.";
  if (message.length > 2000) return "Keep the message under 2000 characters.";
  if (unsafeText(message)) return "Message cannot include scripts or HTML.";
  if (!/[\p{L}]/u.test(message)) return "Write the message in words.";
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
