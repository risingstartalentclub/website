import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { isWinnerReelSlot, playableReel, type PlayableReel } from "@/lib/reels";
import { isSupabaseConfigured, supabaseEnv } from "@/lib/supabase/env";

export async function getWinnerReels(): Promise<PlayableReel[]> {
  "use cache";
  cacheTag("winner-reels");
  cacheLife("max");

  if (!isSupabaseConfigured()) return [];

  const { url, key } = supabaseEnv();
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("winner_reels")
    .select("id, title, video_url, slot")
    .eq("visible", true)
    .order("slot", { ascending: true });
  if (error || !data) return [];

  const reels: PlayableReel[] = [];
  for (const row of data) {
    if (typeof row.id !== "string" || typeof row.video_url !== "string" || !isWinnerReelSlot(Number(row.slot))) {
      continue;
    }
    const playable = playableReel(row.video_url);
    if (!playable) continue;
    reels.push({
      id: row.id,
      title: typeof row.title === "string" && row.title.trim() ? row.title : "Winner reel",
      kind: playable.kind,
      src: playable.src,
    });
  }
  return reels;
}
