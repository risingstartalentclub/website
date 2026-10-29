import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { contests, type Contest } from "@/lib/content";
import { isSupabaseConfigured, supabaseEnv } from "@/lib/supabase/env";

export type ContestRow = {
  slug: string;
  name: string;
  banner_url: string;
  description: string;
  reward: string;
  entry_fee: number | string;
  start_date: string;
  end_date: string;
  result_date: string;
  registration_status: string;
  age_range: string;
  is_hero?: boolean;
  participation_message?: string | null;
};

const contestColumnsLegacy =
  "slug, name, banner_url, description, reward, entry_fee, start_date, end_date, result_date, registration_status, age_range, is_hero, sort_order";

const contestColumns = `${contestColumnsLegacy}, participation_message`;

function dayLabel(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function feeLabel(value: number | string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "Free Entry";
  return `₹${amount}`;
}

export function contestFromRow(row: ContestRow): Contest {
  const end = typeof row.end_date === "string" ? row.end_date.slice(0, 10) : "";
  const endTime = end ? new Date(`${end}T00:00:00`).getTime() : 0;
  const soon = endTime > 0 && endTime - Date.now() < 7 * 24 * 60 * 60 * 1000;
  return {
    slug: row.slug,
    title: row.name,
    categoryLabel: row.age_range,
    endsLabel: end ? `Ends ${dayLabel(end)}` : "",
    endsUrgent: soon && row.registration_status !== "closed",
    description: row.description,
    reward: row.reward,
    rewardIcon: "emoji_events",
    fee: feeLabel(row.entry_fee),
    deadline: end ? dayLabel(end) : "",
    image: row.banner_url,
    imageAlt: row.name,
    status: row.registration_status === "closed" ? "closed" : "open",
    isHero: row.is_hero === true,
    ageRange: row.age_range,
    entryFee: String(row.entry_fee ?? "0"),
    startDate: typeof row.start_date === "string" ? row.start_date.slice(0, 10) : "",
    endDate: end,
    resultDate: typeof row.result_date === "string" ? row.result_date.slice(0, 10) : "",
    participationMessage:
      typeof row.participation_message === "string" ? row.participation_message : "",
  };
}

export async function getContests(sample = true): Promise<Contest[]> {
  "use cache";
  cacheTag("contests");
  cacheLife("max");

  if (!isSupabaseConfigured()) return sample ? contests : [];

  const { url, key } = supabaseEnv();
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  let { data, error } = await supabase
    .from("contests")
    .select(contestColumns)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error?.code === "42703") {
    const retry = await supabase
      .from("contests")
      .select(contestColumnsLegacy)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    data = retry.data as typeof data;
    error = retry.error;
  }

  if (error || !data) return sample ? contests : [];
  if (data.length === 0) return [];
  return data.flatMap((row) => {
    const item = row as ContestRow;
    if (!item.name || !item.banner_url) return [];
    return [contestFromRow(item)];
  });
}

export { contestColumns, contestColumnsLegacy };
