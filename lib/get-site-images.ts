import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import {
  isSafeImageUrl,
  isSiteImageKey,
  siteImageSlots,
  type SiteImages,
} from "@/lib/site-images";
import { isSupabaseConfigured, supabaseEnv } from "@/lib/supabase/env";

function fallbackImages(): SiteImages {
  return Object.fromEntries(siteImageSlots.map((slot) => [slot.key, slot.fallback])) as SiteImages;
}

export async function getSiteImages(): Promise<SiteImages> {
  "use cache";
  cacheTag("site-images");
  cacheLife("max");

  const images = fallbackImages();
  if (!isSupabaseConfigured()) return images;

  const { url, key } = supabaseEnv();
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.from("site_media").select("key, image_url");
  if (error || !data) return images;

  for (const row of data) {
    if (
      typeof row.key === "string" &&
      typeof row.image_url === "string" &&
      isSiteImageKey(row.key) &&
      isSafeImageUrl(row.image_url)
    ) {
      images[row.key] = row.image_url;
    }
  }

  return images;
}
