"use server";

import { clubRegistration, contests } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/env";
import { emailError, normalizeEmail } from "@/lib/validation";

export type EntryState = {
  ok: boolean;
  message: string;
} | null;

const knownContests = new Map(
  [...contests, clubRegistration].map((contest) => [contest.slug, contest.title]),
);

export async function submitEntry(
  _previous: EntryState,
  formData: FormData,
): Promise<EntryState> {
  const participantName = String(formData.get("participantName") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const contestSlug = String(formData.get("contestSlug") ?? "").trim();
  let contestTitle = knownContests.get(contestSlug) ?? null;

  if (participantName.length < 2 || participantName.length > 120) {
    return { ok: false, message: "Enter the participant's full name." };
  }
  const invalidEmail = emailError(email);
  if (invalidEmail) {
    return { ok: false, message: invalidEmail };
  }
  if (!isSupabaseConfigured()) {
    return { ok: false, message: supabaseSetupMessage };
  }

  const supabase = await createClient();
  if (!contestTitle) {
    const { data: contest } = await supabase
      .from("contests")
      .select("title, status")
      .eq("slug", contestSlug)
      .maybeSingle();
    if (contest && contest.status !== "closed" && typeof contest.title === "string") {
      contestTitle = contest.title;
    }
  }
  if (!contestTitle) {
    return { ok: false, message: "Choose a contest before submitting." };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("entries").insert({
    participant_name: participantName,
    email,
    contest_slug: contestSlug,
    contest_title: contestTitle,
    user_id: user?.id ?? null,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        ok: false,
        message: "This email is already registered for this contest.",
      };
    }
    return {
      ok: false,
      message: "We could not save this entry. Please try again in a moment.",
    };
  }

  return {
    ok: true,
    message:
      "Your free entry is confirmed. We will email the submission guidelines and next steps.",
  };
}
