"use server";

import { revalidatePath, updateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/env";
import { isWinnerReelSlot, playableReel } from "@/lib/reels";

export type ReelState = {
  error?: string;
  message?: string;
} | null;

const reelSetup =
  "Run supabase/3-winner-reels.sql once in the Supabase SQL editor, then save the card again.";

async function requireAdmin() {
  if (!isSupabaseConfigured()) return { supabase: null, error: supabaseSetupMessage };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "Log in with an admin account." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") return { supabase: null, error: "Only an admin can change reels." };
  return { supabase, error: null };
}

export async function saveWinnerReel(
  _previous: ReelState,
  formData: FormData,
): Promise<ReelState> {
  const slot = Number(formData.get("slot"));
  const title = String(formData.get("title") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  if (!isWinnerReelSlot(slot)) return { error: "That card could not be saved." };
  if (!title || title.length > 80) return { error: "Add a title of 80 characters or less." };
  if (!playableReel(videoUrl)) {
    return {
      error: "Paste an Instagram reel link, such as https://www.instagram.com/reel/...",
    };
  }

  const access = await requireAdmin();
  if (access.error || !access.supabase) return { error: access.error ?? "Log in with an admin account." };

  const { data: existing } = await access.supabase
    .from("winner_reels")
    .select("id")
    .eq("slot", slot)
    .eq("visible", true)
    .maybeSingle();

  const { error } = await access.supabase.from("winner_reels").upsert(
    { slot, title, video_url: videoUrl, visible: true },
    { onConflict: "slot" },
  );
  if (error) return { error: reelSetup };

  updateTag("winner-reels");
  revalidatePath("/", "layout");
  return {
    message: existing
      ? "Reel replaced. Meet Our Rising Stars is updated."
      : "Reel card added. It is on Meet Our Rising Stars now.",
  };
}

export async function deleteWinnerReel(
  _previous: ReelState,
  formData: FormData,
): Promise<ReelState> {
  const slot = Number(formData.get("slot"));
  if (!isWinnerReelSlot(slot)) return { error: "That card could not be deleted." };

  const access = await requireAdmin();
  if (access.error || !access.supabase) return { error: access.error ?? "Log in with an admin account." };

  const { data, error } = await access.supabase
    .from("winner_reels")
    .delete()
    .eq("slot", slot)
    .select("id");
  if (error || !data?.length) {
    return {
      error: "Run supabase/3-winner-reels.sql once in the Supabase SQL editor, then delete the card again.",
    };
  }

  updateTag("winner-reels");
  revalidatePath("/", "layout");
  return { message: "Reel deleted. It is removed from Meet Our Rising Stars." };
}
