import { Suspense } from "react";
import { CompetitionsSection } from "@/components/competitions-section";
import { contests } from "@/lib/content";
import { getContests } from "@/lib/get-contests";
import { getSiteImages } from "@/lib/get-site-images";
import { applyContestImages } from "@/lib/site-images";
import { getViewer } from "@/lib/viewer";

export function CompetitionsLive({ limit }: { limit?: number }) {
  return (
    <Suspense
      fallback={
        <CompetitionsSection
          limit={limit}
          items={contests.map((contest) => ({ ...contest, image: "" })).slice(0, limit)}
        />
      }
    >
      <LiveCompetitions limit={limit} />
    </Suspense>
  );
}

async function LiveCompetitions({ limit }: { limit?: number }) {
  const [images, items, viewer] = await Promise.all([
    getSiteImages(),
    getContests(),
    getViewer("public"),
  ]);
  return (
    <CompetitionsSection
      items={applyContestImages(items, images)}
      limit={limit}
      signedIn={viewer.signedIn}
    />
  );
}
