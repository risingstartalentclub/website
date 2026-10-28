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
  "Run supabase/4-contest-cards.sql once in the Supabase SQL editor, then save the card again.";
const heroSqlMessage =
  "Run supabase/6-hero-and-people.sql once in the Supabase SQL editor, then save the card again.";

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
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return { supabase: null, error: "Only an admin can change contests." };
  return { supabase, error: null };
}

function cardFromForm(formData: FormData) {
  const title = text(formData, "title", 120);
  const description = text(formData, "description", 400);
  const categoryLabel = text(formData, "categoryLabel", 80);
  const endsLabel = text(formData, "endsLabel", 80);
  const deadline = text(formData, "deadline", 40);
  const reward = text(formData, "reward", 120);
  const fee = text(formData, "fee", 40);
  const imageAlt = text(formData, "imageAlt", 160);
  const status = text(formData, "status", 20) === "closed" ? "closed" : "open";
  const endsUrgent = formData.get("endsUrgent") === "on";
  const isHero = formData.get("isHero") === "on";

  if (title.length < 2) return { error: "Enter the contest title." };
  if (description.length < 10) return { error: "Enter a short description." };
  if (categoryLabel.length < 2 || endsLabel.length < 2 || deadline.length < 2) {
    return { error: "Fill in the category, end label, and deadline." };
  }
  if (reward.length < 2 || fee.length < 2) return { error: "Enter the reward and the entry fee." };

  return {
    row: {
      title,
      description,
      category_label: categoryLabel,
      ends_label: endsLabel,
      ends_urgent: endsUrgent,
      deadline,
      reward,
      fee,
      image_alt: imageAlt || title,
      status,
      is_hero: isHero,
    },
  };
}

function failed(error: { code?: string; message?: string }) {
  if (error.code === "23502" && error.message?.includes("age_")) {
    return "Run supabase/5-remove-age-groups.sql once in the Supabase SQL editor, then save the card again.";
  }
  if (error.code === "42703" && error.message?.includes("is_hero")) return heroSqlMessage;
  if (error.code === "42P01" || error.code === "42703" || error.message?.includes("contests")) {
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
  const slug = existing || slugify(parsed.row.title);
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

  const row = { ...parsed.row, image_url: image };
  const { error } = existing
    ? await admin.supabase.from("contests").update(row).eq("slug", slug)
    : await admin.supabase
        .from("contests")
        .insert({ ...row, slug, sort_order: sortOrder, reward_icon: "emoji_events" });

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
