import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/icon";
import { WinnerReels } from "@/components/winner-reels";
import { getWinnerReels } from "@/lib/get-winner-reels";
import type { PlayableReel } from "@/lib/reels";

export function WinnersSection() {
  return (
    <Suspense fallback={<WinnersView reels={[]} />}>
      <WinnersLive />
    </Suspense>
  );
}

async function WinnersLive() {
  return <WinnersView reels={await getWinnerReels()} />;
}

function WinnersView({ reels }: { reels: PlayableReel[] }) {
  return (
    <section className="w-full scroll-mt-20 bg-surface-container-lowest py-24" id="winners">
      <div className="mx-auto max-w-[1280px] px-margin-mobile md:px-margin">
        <div className="mb-space-xl flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div>
            <span className="font-label-sm text-label-sm mb-space-xs block font-bold tracking-widest text-tertiary-container uppercase">
              Hall of Honors
            </span>
            <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary">
              Meet Our Rising Stars
            </h2>
            <p className="font-body-md text-body-md mt-1 max-w-2xl text-on-surface-variant">
              Every entry tells a story. Celebrate the creativity, confidence,
              and special moments of our amazing young participants.
            </p>
          </div>
          <Link
            className="font-label-md text-label-md inline-flex items-center gap-space-xs self-start rounded-lg bg-surface-container px-space-lg py-3 whitespace-nowrap text-primary transition-colors hover:bg-surface-container-high md:self-auto"
            href="/winners"
          >
            <span>View All Winners</span>
            <Icon name="workspace_premium" className="text-[18px]" />
          </Link>
        </div>
        <WinnerReels reels={reels} />
      </div>
    </section>
  );
}
