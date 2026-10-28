import { ReelFrame } from "@/components/reel-frame";
import type { PlayableReel } from "@/lib/reels";

function WinnerCard({ reel }: { reel: PlayableReel }) {
  return (
    <article className="flex w-[min(18rem,78vw)] shrink-0 flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-md sm:w-72">
      <ReelFrame kind={reel.kind} src={reel.src} title={reel.title} />
      <div className="bg-surface-container-low p-space-lg">
        <h3 className="font-headline-md text-headline-md font-bold text-primary">{reel.title}</h3>
      </div>
    </article>
  );
}

export function WinnerReels({ reels }: { reels: PlayableReel[] }) {
  if (reels.length === 0) return null;

  const row = (copy: boolean) => (
    <div className="flex gap-4 pr-4" data-reel-copy={copy ? "true" : undefined} aria-hidden={copy || undefined}>
      {reels.map((reel) => (
        <WinnerCard key={copy ? `${reel.id}-copy` : reel.id} reel={reel} />
      ))}
    </div>
  );

  return (
    <div className="reel-row no-scrollbar overflow-hidden" aria-label="Winner reels">
      <div className="reel-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
