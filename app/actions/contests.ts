"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/env";
import { uploadAdminImage } from "@/app/actions/media";
import { isSafeImageUrl } from "@/lib/site-images";

export type ContestState = {
  error?: string;
  message?: string;
} | null;

const setupMessage =
  "Run supabase/1-schema.sql once in the Supabase SQL editor, then save the contest again.";

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

function text(formData: FormData, name: string, max: number) {
  return String(formData.get(name) ?? "").trim().slice(0, max);
}

async function requireAdmin() {
  if (!isSupabaseConfigured()) return { supabase: null, error: supabaseSetupMessage };
  const supabase = await createClient("admin");
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "Log in with an admin account." };
  const { data: adminRow } = await supabase.from("admins").select("id").eq("id", user.id).maybeSingle();
  if (!adminRow) return { supabase: null, error: "Only an admin can change contests." };
  return { supabase, error: null };
}

function dateValue(formData: FormData, name: string) {
  const value = text(formData, name, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function cardFromForm(formData: FormData) {
  const name = text(formData, "name", 120);
  const description = text(formData, "description", 800);
  const reward = text(formData, "reward", 120);
  const ageRange = text(formData, "ageRange", 40);
  const entryFee = Number(text(formData, "entryFee", 12));
  const startDate = dateValue(formData, "startDate");
  const endDate = dateValue(formData, "endDate");
  const resultDate = dateValue(formData, "resultDate");
  const registrationStatus = text(formData, "registrationStatus", 20) === "closed" ? "closed" : "open";
  const isHero = formData.get("isHero") === "on";
  const participationMessage = text(formData, "participationMessage", 800);

  if (name.length < 2) return { error: "Enter the contest name." };
  if (description.length < 10) return { error: "Enter a short description." };
  if (ageRange.length < 1) return { error: "Enter the age range." };
  if (reward.length < 2) return { error: "Enter the reward." };
  if (!Number.isFinite(entryFee) || entryFee < 0) return { error: "Enter an entry fee of 0 or more. Use 0 for free entry." };
  if (!startDate || !endDate || !resultDate) return { error: "Enter the start, end, and result dates." };
  if (startDate > endDate || endDate > resultDate) {
    return { error: "The start date must be on or before the end date, and the result date must be on or after the end date." };
  }
  if (participationMessage.length < 10) {
    return { error: "Enter the thank-you or instruction parents see after they enter." };
  }
  if (/[<>]/.test(participationMessage) || /javascript\s*:/i.test(participationMessage)) {
    return { error: "The message after participation cannot include scripts or HTML." };
  }

  return {
    row: {
      name,
      description,
      reward,
      age_range: ageRange,
      entry_fee: entryFee,
      start_date: startDate,
      end_date: endDate,
      result_date: resultDate,
      registration_status: registrationStatus,
      is_hero: isHero,
      participation_message: participationMessage,
    },
  };
}

function failed(error: { code?: string; message?: string }) {
  if (error.code === "42703") {
    return "Run supabase/8-participation-message.sql in the Supabase SQL editor, then save the contest again.";
  }
  if (error.code === "42P01" || error.message?.includes("contests")) {
    return setupMessage;
  }
  return "The contest could not be saved. Please try again.";
}

export async function saveContest(_previous: ContestState, formData: FormData): Promise<ContestState> {
  const admin = await requireAdmin();
  if (!admin.supabase) return { error: admin.error ?? setupMessage };
  const parsed = cardFromForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  const file = formData.get("file");
  let image = text(formData, "image", 4000);
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadAdminImage(file);
    if ("error" in uploaded) return { error: uploaded.error };
    image = uploaded.url;
  }
  if (!isSafeImageUrl(image)) return { error: "Choose an image." };

  const existing = text(formData, "slug", 80);
  const slug = existing || slugify(parsed.row.name);
  if (slug.length < 2) return { error: "Enter a contest title." };

  let sortOrder = 1;
  if (!existing) {
    const { data: latest } = await admin.supabase
      .from("contests")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1);
    sortOrder = Number(latest?.[0]?.sort_order ?? 0) + 1;
  }

  if (parsed.row.is_hero) {
    const { error: clearError } = await admin.supabase
      .from("contests")
      .update({ is_hero: false })
      .eq("is_hero", true)
      .neq("slug", slug);
    if (clearError) return { error: failed(clearError) };
  }

  const row = { ...parsed.row, banner_url: image };
  const { error } = existing
    ? await admin.supabase.from("contests").update(row).eq("slug", slug)
    : await admin.supabase.from("contests").insert({ ...row, slug, sort_order: sortOrder });

  if (error) {
    if (error.code === "23505" && error.message?.includes("one_hero")) {
      return { error: "Another contest is already on the homepage. Save this card again to replace it." };
    }
    return { error: error.code === "23505" ? "A contest with this name already exists." : failed(error) };
  }

  updateTag("contests");
  revalidatePath("/", "layout");
  return { message: existing ? "Contest updated." : "Contest added." };
}

export async function deleteContest(_previous: ContestState, formData: FormData): Promise<ContestState> {
  const admin = await requireAdmin();
  if (!admin.supabase) return { error: admin.error ?? setupMessage };
  const slug = text(formData, "slug", 80);
  if (slug.length < 2) return { error: "Choose a contest to delete." };

  const { error } = await admin.supabase.from("contests").delete().eq("slug", slug);
  if (error) return { error: failed(error) };

  updateTag("contests");
  revalidatePath("/", "layout");
  return { message: "Contest removed." };
}
