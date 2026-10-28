import { headers } from "next/headers";
import {
  clientAddress,
  consumeRateLimit,
  contactSubjects,
  entrySubjects,
  loginSubjects,
  signupSubjects,
  type RateLimitDecision,
} from "@/lib/rate-limit";

async function visitorAddress() {
  return clientAddress(await headers());
}

export async function limitLogin(
  email: string,
  scope: "public" | "admin",
): Promise<RateLimitDecision> {
  const ip = await visitorAddress();
  return consumeRateLimit("login", loginSubjects(ip, email, scope));
}

export async function limitSignup(
  email: string,
  mobile: string,
): Promise<RateLimitDecision> {
  const ip = await visitorAddress();
  return consumeRateLimit("signup", signupSubjects(ip, email, mobile));
}

export async function limitContact(email: string): Promise<RateLimitDecision> {
  const ip = await visitorAddress();
  return consumeRateLimit("contact", contactSubjects(ip, email));
}

export async function limitEntry(email: string): Promise<RateLimitDecision> {
  const ip = await visitorAddress();
  return consumeRateLimit("entry", entrySubjects(ip, email));
}
