import { Suspense } from "react";
import { CompetitionsSection } from "@/components/competitions-section";
import { contests } from "@/lib/content";
import { getContests } from "@/lib/get-contests";
import { getSiteImages } from "@/lib/get-site-images";
import { applyContestImages } from "@/lib/site-images";
import { getViewer } from "@/lib/viewer";

export function CompetitionsLive({ featured = false }: { featured?: boolean }) {
  const preview = featured ? [] : contests;
  return (
    <Suspense
      fallback={
        <CompetitionsSection
          featured={featured}
          items={preview.map((contest) => ({ ...contest, image: "" }))}
        />
      }
    >
      <LiveCompetitions featured={featured} />
    </Suspense>
  );
}

async function LiveCompetitions({ featured }: { featured: boolean }) {
  const [images, items, viewer] = await Promise.all([
    getSiteImages(),
    getContests(!featured),
    getViewer("public"),
  ]);
  const ready = applyContestImages(items, images);
  return (
    <CompetitionsSection
      items={featured ? ready.filter((contest) => contest.isHero).slice(0, 1) : ready}
      featured={featured}
      signedIn={viewer.signedIn}
    />
  );
}
