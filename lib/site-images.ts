import { assets, contests, winners } from "@/lib/content";

export const siteImageSlots = [
  { key: "logo", label: "Club logo", fallback: assets.logo },
  { key: "hero-stage", label: "Homepage stage photo", fallback: assets.heroStage },
  { key: "hero-thumb", label: "Homepage portrait", fallback: assets.heroThumb },
  {
    key: "contest:baby-toddler-festive-look",
    label: "Baby & Toddler Festive Look",
    fallback: contests[0].image,
  },
  {
    key: "contest:diwali-cultural-showcase-2026",
    label: "Diwali & Cultural Showcase 2026",
    fallback: contests[1].image,
  },
  {
    key: "winner:aarav-sharma",
    label: "Winner portrait — Aarav Sharma",
    fallback: winners[0].image,
  },
  {
    key: "winner:ananya-patel",
    label: "Winner portrait — Ananya Patel",
    fallback: winners[1].image,
  },
  {
    key: "winner:rohan-deshmukh",
    label: "Winner portrait — Rohan Deshmukh",
    fallback: winners[2].image,
  },
] as const;

export type SiteImageKey = (typeof siteImageSlots)[number]["key"];
export type SiteImages = Record<SiteImageKey, string>;

const winnerImageKeys = [
  "winner:aarav-sharma",
  "winner:ananya-patel",
  "winner:rohan-deshmukh",
] as const satisfies readonly SiteImageKey[];

export function isSiteImageKey(value: string): value is SiteImageKey {
  return siteImageSlots.some((slot) => slot.key === value);
}

export function labelForSiteImage(key: SiteImageKey) {
  return siteImageSlots.find((slot) => slot.key === key)?.label ?? key;
}

export function isSafeImageUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) {
    return true;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function contestsWithImages(images: SiteImages) {
  return contests.map((contest) => {
    const key = `contest:${contest.slug}`;
    return {
      ...contest,
      image: isSiteImageKey(key) ? images[key] : contest.image,
    };
  });
}

export function winnersWithImages(images: SiteImages) {
  return winners.map((winner, index) => ({
    ...winner,
    image: images[winnerImageKeys[index]] ?? winner.image,
  }));
}
