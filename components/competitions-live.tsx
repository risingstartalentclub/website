import { Suspense } from "react";
import { CompetitionsSection } from "@/components/competitions-section";
import { contests } from "@/lib/content";
import { getSiteImages } from "@/lib/get-site-images";
import { contestsWithImages } from "@/lib/site-images";

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
  const images = await getSiteImages();
  return <CompetitionsSection items={contestsWithImages(images)} />;
}
