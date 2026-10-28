import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { contests, type Contest } from "@/lib/content";
import { isSupabaseConfigured, supabaseEnv } from "@/lib/supabase/env";

export type ContestRow = {
  slug: string;
  title: string;
  category_label: string;
  age_group: string;
  age_badge: string;
  reward: string;
  reward_icon: string;
  fee: string;
  deadline: string;
  ends_label: string;
  ends_urgent: boolean;
  description: string;
  image_url: string;
  image_alt: string;
  status: string;
  sort_order: number;
};

const contestColumns =
  "slug, title, category_label, age_group, age_badge, reward, reward_icon, fee, deadline, ends_label, ends_urgent, description, image_url, image_alt, status, sort_order";

export function contestFromRow(row: ContestRow): Contest {
  const ageGroup = row.age_group === "kids" || row.age_group === "teens" ? row.age_group : "baby";
  return {
    slug: row.slug,
    title: row.title,
    ageGroup,
    categoryLabel: row.category_label,
    ageBadge: row.age_badge,
    endsLabel: row.ends_label,
    endsUrgent: row.ends_urgent,
    description: row.description,
    reward: row.reward,
    rewardIcon: row.reward_icon || "emoji_events",
    fee: row.fee,
    deadline: row.deadline,
    image: row.image_url,
    imageAlt: row.image_alt || row.title,
    status: row.status === "closed" ? "closed" : "open",
  };
}

export async function getContests(): Promise<Contest[]> {
  "use cache";
  cacheTag("contests");
  cacheLife("max");

  if (!isSupabaseConfigured()) return contests;

  const { url, key } = supabaseEnv();
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("contests")
    .select(contestColumns)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return contests;
  if (data.length === 0) return [];
  return data.map((row) => contestFromRow(row as ContestRow));
}

export { contestColumns };
