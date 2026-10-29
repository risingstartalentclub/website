"use server";

import { revalidatePath } from "next/cache";
import { limitEntry } from "@/lib/public-limits";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/env";
import { ageError, genderError, instagramError } from "@/lib/validation";

export type EntryState = {
  ok: boolean;
  message: string;
} | null;

const schemaMessage =
  "Run supabase/4-participants.sql in the Supabase SQL editor, then try again.";

const participantIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function needsSchema(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    error.code === "42703" ||
    error.code === "42883" ||
    error.message?.includes("participants") === true
  );
}

export async function submitEntry(
  _previous: EntryState,
  formData: FormData,
): Promise<EntryState> {
  const contestSlug = String(formData.get("contestSlug") ?? "").trim();
  const existingId = String(formData.get("participantId") ?? "").trim();

  if (!isSupabaseConfigured()) {
    return { ok: false, message: supabaseSetupMessage };
  }
  if (contestSlug.length < 2 || contestSlug.length > 80) {
    return { ok: false, message: "Choose a contest before submitting." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Log in with the parent account before entering a contest." };
  }

  const { data: parent, error: parentError } = await supabase
    .from("parents")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();
  if (parentError || !parent || typeof parent.email !== "string") {
    return { ok: false, message: "Log in with the parent account before entering a contest." };
  }

  const limited = await limitEntry(parent.email);
  if (!limited.allowed) return { ok: false, message: limited.message };

  const { data: contest, error: contestError } = await supabase
    .from("contests")
    .select("name, registration_status")
    .eq("slug", contestSlug)
    .maybeSingle();
  if (contestError) {
    return { ok: false, message: "We could not open this contest. Please try again in a moment." };
  }
  if (!contest || contest.registration_status === "closed" || typeof contest.name !== "string") {
    return { ok: false, message: "Choose an open contest before submitting." };
  }

  let participantId = "";
  let participantName = "";

  if (existingId) {
    if (!participantIdPattern.test(existingId)) {
      return { ok: false, message: "Choose a child before submitting." };
    }
    const { data: child, error: childError } = await supabase
      .from("participants")
      .select("id, full_name")
      .eq("id", existingId)
      .eq("parent_id", user.id)
      .maybeSingle();
    if (needsSchema(childError)) return { ok: false, message: schemaMessage };
    if (childError || !child || typeof child.full_name !== "string") {
      return { ok: false, message: "Choose one of your children before submitting." };
    }
    participantId = child.id;
    participantName = child.full_name;
  } else {
    const fullName = String(formData.get("fullName") ?? "").trim();
    const age = String(formData.get("age") ?? "");
    const gender = String(formData.get("gender") ?? "");
    const instagramUrl = String(formData.get("instagramUrl") ?? "").trim();

    if (fullName.length < 2 || fullName.length > 120) {
      return { ok: false, message: "Enter the full name for the certificate." };
    }
    const invalidAge = ageError(age);
    if (invalidAge) return { ok: false, message: invalidAge };
    const invalidGender = genderError(gender);
    if (invalidGender) return { ok: false, message: invalidGender };
    const invalidInstagram = instagramError(instagramUrl, true);
    if (invalidInstagram) return { ok: false, message: invalidInstagram };

    const { data: created, error: createError } = await supabase
      .from("participants")
      .insert({
        parent_id: user.id,
        full_name: fullName,
        age: Number(age),
        gender,
        instagram_url: instagramUrl,
      })
      .select("id, full_name")
      .single();
    if (needsSchema(createError)) return { ok: false, message: schemaMessage };
    if (createError || !created) {
      return { ok: false, message: "We could not save this child. Please try again in a moment." };
    }
    participantId = created.id;
    participantName = created.full_name;
  }

  const { error } = await supabase.from("entries").insert({
    participant_name: participantName,
    email: parent.email,
    contest_slug: contestSlug,
    contest_title: contest.name,
    user_id: user.id,
    participant_id: participantId,
  });

  if (error) {
    if (needsSchema(error)) return { ok: false, message: schemaMessage };
    if (error.code === "23505") {
      return { ok: false, message: "This child is already entered in this contest." };
    }
    if (error.code === "42501") {
      return { ok: false, message: "Choose an open contest before submitting." };
    }
    return { ok: false, message: "We could not save this entry. Please try again in a moment." };
  }

  revalidatePath("/parent-panel");
  return {
    ok: true,
    message: `${participantName} is entered. You can add another child to this contest.`,
  };
}
