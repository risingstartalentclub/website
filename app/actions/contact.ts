"use server";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/env";
import { emailError, normalizeEmail } from "@/lib/validation";

export type ContactState = {
  ok: boolean;
  message: string;
} | null;

export async function sendMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const message = String(formData.get("message") ?? "").trim();

  if (name.length < 2 || name.length > 120) {
    return { ok: false, message: "Enter your name." };
  }
  const invalidEmail = emailError(email);
  if (invalidEmail) {
    return { ok: false, message: invalidEmail };
  }
  if (message.length < 10 || message.length > 2000) {
    return {
      ok: false,
      message: "Write a message of at least 10 characters.",
    };
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, message: supabaseSetupMessage };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    message,
  });

  if (error) {
    return {
      ok: false,
      message: "We could not send your message. Please try again in a moment.",
    };
  }

  return {
    ok: true,
    message: "Message received. Our support team will reply by email.",
  };
}
