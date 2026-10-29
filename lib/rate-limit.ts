import { createHash } from "node:crypto";

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

type Bucket = {
  count: number;
  resetAt: number;
};

export type LimitSubject = {
  id: string;
  limit: number;
  windowMs: number;
};

export type RateLimitDecision =
  | { allowed: true }
  | { allowed: false; message: string };

const buckets = new Map<string, Bucket>();
let operations = 0;

function digest(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}

function waitMessage(resetAt: number, now: number) {
  const minutes = Math.max(1, Math.ceil((resetAt - now) / 60000));
  if (minutes >= 60) {
    const hours = Math.max(1, Math.ceil(minutes / 60));
    return `Too many attempts. Please try again in ${hours} ${hours === 1 ? "hour" : "hours"}.`;
  }
  return `Too many attempts. Please try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}.`;
}

function prune(now: number) {
  operations += 1;
  if (operations % 200 !== 0 && buckets.size < 2000) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Fixed-window limiter. A request is allowed only when every subject is still
 * under its own limit. Denied requests do not consume another attempt.
 * `now` is injectable so the window math can be checked without waiting.
 */
export function consumeRateLimit(
  action: string,
  subjects: LimitSubject[],
  now = Date.now(),
): RateLimitDecision {
  prune(now);

  const viewed = subjects.map((subject) => {
    const key = `${action}:${digest(`${action}:${subject.id}`)}`;
    const existing = buckets.get(key);
    if (!existing || existing.resetAt <= now) {
      return {
        key,
        count: 0,
        resetAt: now + subject.windowMs,
        limit: subject.limit,
      };
    }
    return {
      key,
      count: existing.count,
      resetAt: existing.resetAt,
      limit: subject.limit,
    };
  });

  const blocked = viewed.find((item) => item.count >= item.limit);
  if (blocked) {
    return { allowed: false, message: waitMessage(blocked.resetAt, now) };
  }

  for (const item of viewed) {
    buckets.set(item.key, { count: item.count + 1, resetAt: item.resetAt });
  }
  return { allowed: true };
}

export function loginSubjects(ip: string, email: string, scope: "public" | "admin"): LimitSubject[] {
  const subjects: LimitSubject[] = [
    { id: `ip:${ip}`, limit: 40, windowMs: FIFTEEN_MINUTES },
    { id: `email:${email}`, limit: 10, windowMs: FIFTEEN_MINUTES },
    { id: "global", limit: 400, windowMs: FIFTEEN_MINUTES },
  ];
  if (scope === "admin") {
    subjects.push({ id: `admin-ip:${ip}`, limit: 10, windowMs: FIFTEEN_MINUTES });
  }
  return subjects;
}

export function signupSubjects(ip: string, email: string, mobile: string): LimitSubject[] {
  return [
    { id: `ip:${ip}`, limit: 20, windowMs: ONE_HOUR },
    { id: `email:${email}`, limit: 6, windowMs: ONE_HOUR },
    { id: `mobile:${mobile}`, limit: 6, windowMs: ONE_HOUR },
    { id: "global", limit: 80, windowMs: ONE_HOUR },
  ];
}

export function contactSubjects(ip: string, email: string): LimitSubject[] {
  return [
    { id: `ip:${ip}`, limit: 16, windowMs: ONE_HOUR },
    { id: `email:${email}`, limit: 6, windowMs: ONE_HOUR },
    { id: "global", limit: 80, windowMs: ONE_HOUR },
  ];
}

export function entrySubjects(ip: string, email: string): LimitSubject[] {
  return [
    { id: `ip:${ip}`, limit: 40, windowMs: ONE_HOUR },
    { id: `email:${email}`, limit: 16, windowMs: ONE_HOUR },
    { id: "global", limit: 400, windowMs: ONE_HOUR },
  ];
}

function plausibleIp(value: string) {
  if (value.length < 2 || value.length > 45) return false;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(value)) {
    return value.split(".").every((part) => {
      if (part.length > 1 && part.startsWith("0")) return false;
      const octet = Number(part);
      return Number.isInteger(octet) && octet >= 0 && octet <= 255;
    });
  }
  return value.includes(":") && /^[0-9a-f:.]+$/i.test(value);
}

/**
 * Visitor address from the proxy header. Hosts such as Vercel overwrite
 * x-forwarded-for, so the first address is the visitor. Email and site-wide
 * limits still apply when that header is missing.
 */
export function clientAddress(headerStore: Headers) {
  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  if (plausibleIp(forwarded)) return forwarded;
  const realIp = headerStore.get("x-real-ip")?.trim() ?? "";
  if (plausibleIp(realIp)) return realIp;
  return "unknown";
}
