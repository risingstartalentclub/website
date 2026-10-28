"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/env";
import {
  isSiteImageKey,
  labelForSiteImage,
  type SiteImageKey,
} from "@/lib/site-images";

export type MediaState = {
  key?: SiteImageKey;
  error?: string;
  message?: string;
  imageUrl?: string;
} | null;

const maxBytes = 5 * 1024 * 1024;

function imageKind(bytes: Uint8Array) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { type: "image/jpeg", ext: "jpg" } as const;
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return { type: "image/png", ext: "png" } as const;
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { type: "image/webp", ext: "webp" } as const;
  }
  return null;
}

export async function updateSiteImage(
  _previous: MediaState,
  formData: FormData,
): Promise<MediaState> {
  const key = String(formData.get("key") ?? "");
  if (!isSiteImageKey(key)) {
    return { error: "That image cannot be changed." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { key, error: "Choose an image to upload." };
  }
  if (file.size > maxBytes) {
    return { key, error: "Use an image under 5 MB." };
  }
  if (!isSupabaseConfigured()) {
    return { key, error: supabaseSetupMessage };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = imageKind(bytes);
  if (!kind) {
    return { key, error: "Use a JPG, PNG, or WebP image." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { key, error: "Log in with an admin account to change images." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.role !== "admin") {
    return { key, error: "Only an admin can change images." };
  }

  const path = `${key.replaceAll(":", "/")}/${crypto.randomUUID()}.${kind.ext}`;
  const { error: uploadError } = await supabase.storage
    .from("site-images")
    .upload(path, bytes, { contentType: kind.type, upsert: false });
  if (uploadError) {
    return {
      key,
      error: "The image could not be saved. Run supabase/schema.sql so the site-images bucket exists.",
    };
  }

  const { data: stored } = supabase.storage.from("site-images").getPublicUrl(path);
  const { error: saveError } = await supabase.from("site_media").upsert({
    key,
    label: labelForSiteImage(key),
    image_url: stored.publicUrl,
    updated_at: new Date().toISOString(),
  });
  if (saveError) {
    return { key, error: "The image uploaded, but the site could not use it yet." };
  }

  revalidatePath("/", "layout");
  return { key, imageUrl: stored.publicUrl, message: "Image updated. The public site is using it now." };
}
