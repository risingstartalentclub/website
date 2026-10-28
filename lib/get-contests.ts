import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { contests, type Contest } from "@/lib/content";
import { isSupabaseConfigured, supabaseEnv } from "@/lib/supabase/env";

export type ContestRow = {
  slug: string;
  title: string;
  category_label: string;
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
  is_hero?: boolean;
};

const contestColumns =
  "slug, title, category_label, reward, reward_icon, fee, deadline, ends_label, ends_urgent, description, image_url, image_alt, status, sort_order, is_hero";

const categoryWithoutAge: Record<string, string> = {
  "Baby & Toddler (Ages 1-3)": "Festive Look",
  "Kids & Juniors (Ages 4-12)": "Cultural Showcase",
  "Youth Category (Ages 1-20)": "Open Registration",
};

function categoryLabel(value: string) {
  const known = categoryWithoutAge[value];
  if (known) return known;
  return value.replace(/\s*\(Ages[^)]*\)/gi, "").trim();
}

export function contestFromRow(row: ContestRow): Contest {
  return {
    slug: row.slug,
    title: row.title,
    categoryLabel: categoryLabel(row.category_label),
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
    isHero: row.is_hero === true,
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
  const ordered = supabase
    .from("contests")
    .select(contestColumns)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  const { data, error } = await ordered;

  if (error?.code === "42703" || error?.message?.includes("is_hero")) {
    const legacy = await supabase
      .from("contests")
      .select(contestColumns.replace(", is_hero", ""))
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (legacy.error || !legacy.data) return contests;
    if (legacy.data.length === 0) return [];
    return legacy.data.map((row, index) =>
      contestFromRow({ ...(row as ContestRow), is_hero: index === 0 }),
    );
  }

  if (error || !data) return contests;
  if (data.length === 0) return [];
  return data.map((row) => contestFromRow(row as ContestRow));
}

export { contestColumns };
