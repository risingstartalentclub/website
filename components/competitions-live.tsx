import { Suspense } from "react";
import { CompetitionsSection } from "@/components/competitions-section";
import { contestsWithImages, getSiteImages } from "@/lib/site-images";

export function CompetitionsLive() {
  return (
    <Suspense fallback={<CompetitionsSection />}>
      <LiveCompetitions />
    </Suspense>
  );
}

async function LiveCompetitions() {
  const images = await getSiteImages();
  return <CompetitionsSection items={contestsWithImages(images)} />;
}
