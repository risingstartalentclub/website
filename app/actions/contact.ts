"use server";

import { limitContact } from "@/lib/public-limits";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/env";
import { contactMessageError, contactNameError, emailError, normalizeEmail } from "@/lib/validation";

export type ContactState = {
  ok: boolean;
  message: string;
} | null;

export async function sendMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim().replace(/\s+/g, " ");
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const message = String(formData.get("message") ?? "").trim();

  const invalidName = contactNameError(name);
  if (invalidName) return { ok: false, message: invalidName };
  const invalidEmail = emailError(email);
  if (invalidEmail) return { ok: false, message: invalidEmail };
  const invalidMessage = contactMessageError(message);
  if (invalidMessage) return { ok: false, message: invalidMessage };
  if (!isSupabaseConfigured()) {
    return { ok: false, message: supabaseSetupMessage };
  }

  const limited = await limitContact(email);
  if (!limited.allowed) return { ok: false, message: limited.message };

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
