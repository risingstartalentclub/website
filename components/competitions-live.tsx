import { Suspense } from "react";
import { CompetitionsSection } from "@/components/competitions-section";
import { contests } from "@/lib/content";
import { getContests } from "@/lib/get-contests";
import { getSiteImages } from "@/lib/get-site-images";
import { applyContestImages } from "@/lib/site-images";
import { getViewer } from "@/lib/viewer";

export function CompetitionsLive() {
  return (
    <Suspense
      fallback={
        <CompetitionsSection items={contests.map((contest) => ({ ...contest, image: "" }))} />
      }
    >
      <LiveCompetitions />
    </Suspense>
  );
}

async function LiveCompetitions() {
  const [images, items, viewer] = await Promise.all([
    getSiteImages(),
    getContests(),
    getViewer("public"),
  ]);
  return (
    <CompetitionsSection
      items={applyContestImages(items, images)}
      signedIn={viewer.signedIn && !viewer.isAdmin}
    />
  );
}
