import Link from "next/link";
import { Suspense } from "react";
import { winners, type Winner } from "@/lib/content";
import { Icon } from "@/components/icon";
import { getSiteImages } from "@/lib/get-site-images";
import { winnersWithImages } from "@/lib/site-images";

export function WinnersSection() {
  return (
    <Suspense
      fallback={<WinnersView people={winners.map((person) => ({ ...person, image: "" }))} />}
    >
      <WinnersLive />
    </Suspense>
  );
}

async function WinnersLive() {
  const images = await getSiteImages();
  return <WinnersView people={winnersWithImages(images)} />;
}

function WinnersView({ people }: { people: Winner[] }) {
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
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {people.map((winner) => (
            <article
              key={winner.name}
              className="group flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-md"
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                {winner.image ? (
                  <img
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    alt={winner.imageAlt}
                    src={winner.image}
                  />
                ) : (
                  <div className="h-full w-full bg-surface-container" />
                )}
                <div className="absolute top-4 left-4">
                  <span
                    className={`font-label-sm text-label-sm flex items-center gap-1 rounded-full px-3 py-1 font-bold shadow-md ${winner.badgeGold ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-primary-container text-on-primary"}`}
                  >
                    <Icon name={winner.badgeIcon} className="text-[14px]" />
                    {winner.badge}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-primary/80 to-transparent" />
                <div className="absolute right-4 bottom-4 left-4 text-on-primary">
                  <h3 className="font-headline-md text-headline-md font-bold text-on-primary">
                    {winner.name}
                  </h3>
                  <p
                    className={`font-label-sm text-label-sm ${winner.badgeGold ? "text-tertiary-fixed" : "text-secondary-fixed"}`}
                  >
                    {winner.contest}
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between bg-surface-container-low p-space-lg">
                <p className="font-body-sm text-body-sm text-on-surface-variant italic">
                  &quot;{winner.quote}&quot;
                </p>
                <div className="font-label-sm text-label-sm mt-space-md flex items-center justify-between pt-space-sm text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Icon
                      name="verified"
                      className="text-[16px] text-tertiary-container"
                    />
                    Verified Title
                  </span>
                  <span>{winner.title}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
