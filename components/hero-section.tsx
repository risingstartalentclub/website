import { Suspense } from "react";
import { Icon } from "@/components/icon";
import type { Contest } from "@/lib/content";
import { getContests } from "@/lib/get-contests";
import { getSiteImages } from "@/lib/get-site-images";
import { applyContestImages } from "@/lib/site-images";

export function HeroSection() {
  return (
    <Suspense fallback={<HeroView contest={null} />}>
      <HeroLive />
    </Suspense>
  );
}

async function HeroLive() {
  const [images, items] = await Promise.all([getSiteImages(), getContests(false)]);
  const hero = applyContestImages(items, images).find((item) => item.isHero) ?? null;
  return <HeroView contest={hero} />;
}

function HeroView({ contest }: { contest: Contest | null }) {
  return (
    <section id="home" className="relative w-full scroll-mt-20 overflow-hidden bg-gradient-to-b from-surface-container-low via-surface to-surface-container-lowest pt-space-xl pb-24">
      <div className="pointer-events-none absolute -top-32 right-1/4 -z-0 h-[520px] w-[520px] rounded-full bg-tertiary-fixed/35 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -left-32 -z-0 h-96 w-96 rounded-full bg-secondary-fixed/40 blur-3xl" />
      <div className="relative z-10 mx-auto max-w-[1280px] px-margin-mobile md:px-margin">
        <div className="grid grid-cols-1 items-center gap-gutter lg:grid-cols-12">
          <div className="flex flex-col gap-space-lg lg:col-span-7">
            <div className="inline-flex items-center gap-space-sm self-start rounded-full bg-surface-container-lowest px-space-md py-space-xs shadow-sm">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-tertiary-container" />
              <span className="font-label-sm text-label-sm tracking-wider text-secondary uppercase">
                Autumn & Festive Season 2026
              </span>
            </div>
            <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg tracking-tight text-primary">
              Little Stars. <br />
              <span className="text-secondary">Big Dreams.</span>{" "}
              <span className="relative inline-block pb-4 text-tertiary-container">
                Endless Possibilities.
                <svg
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-0 left-0 h-3 w-full text-tertiary-fixed-dim"
                  fill="none"
                  viewBox="0 0 160 12"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 9.5C40 2.5 120 2 158 8"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="3.5"
                  />
                </svg>
              </span>
            </h1>
            <p className="font-body-lg text-body-lg max-w-xl text-on-surface-variant">
              Discover exciting contests for babies, kids, teens, and young
              talents. From adorable festive moments to creative challenges,
              Rising Star Talent Club gives every young star an opportunity to
              participate, express themselves, and shine.
            </p>
            <div className="flex flex-col items-stretch gap-space-md pt-space-xs sm:flex-row sm:items-center">
              <a
                className="font-label-lg text-label-lg group inline-flex items-center justify-center gap-space-sm rounded-lg bg-primary-container px-space-xl py-4 text-on-primary shadow-md transition-all hover:bg-secondary"
                href="#competitions"
              >
                <span>Explore Contests</span>
                <Icon
                  name="arrow_forward"
                  className="text-[18px] transition-transform group-hover:translate-x-1"
                />
              </a>
              <a
                className="font-label-lg text-label-lg inline-flex items-center justify-center gap-space-sm rounded-lg bg-surface-container-lowest px-space-lg py-4 text-primary shadow-sm transition-colors hover:bg-surface-container"
                href="https://www.instagram.com/risingstartalentclub"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="how_to_reg" className="text-[20px] text-secondary" />
                <span>Join the Club</span>
              </a>
            </div>
            <div className="flex items-center gap-space-sm pt-space-xs text-on-surface-variant">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
                <Icon name="stars" filled className="text-[15px]" />
              </div>
              <p className="font-label-md text-label-md font-semibold text-primary">
                Your Talent. Your Platform. Your Moment to Shine. • Family
                Friendly & Safe
              </p>
            </div>
            <div className="grid max-w-lg grid-cols-3 gap-space-md pt-space-md">
              {[
                ["2,400+", "Active Entrants"],
                ["100%", "Verified Contests"],
                ["Fair Panel", "Certified Jury"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-lg bg-surface-container-lowest p-space-sm shadow-sm"
                >
                  <div className="font-headline-sm text-headline-sm text-primary">
                    {value}
                  </div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-space-lg lg:col-span-5 lg:mt-0">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
              <a
                href="#competitions"
                className="absolute inset-0 flex flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-xl"
              >
                {contest?.image ? (
                  <img className="h-3/5 w-full object-cover" alt={contest.imageAlt} src={contest.image} />
                ) : (
                  <div className="h-3/5 w-full bg-surface-container" />
                )}
                <div className="flex flex-1 flex-col justify-between bg-surface-container-lowest p-space-md">
                  <div>
                    <div className="mb-space-xs flex items-center justify-between gap-2">
                      <span className="font-label-sm text-label-sm rounded-full bg-tertiary-fixed px-2 py-0.5 font-bold text-on-tertiary-fixed">
                        Homepage contest
                      </span>
                      <span className="font-label-sm text-label-sm rounded-full bg-surface-container px-2 py-0.5 font-bold text-secondary">
                        {contest ? contest.categoryLabel : "Coming soon"}
                      </span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-primary">
                      {contest?.title ?? "A featured contest will appear here"}
                    </h3>
                    <p className="font-body-sm text-body-sm mt-1 line-clamp-3 text-on-surface-variant">
                      {contest?.description ??
                        "The contest marked for the homepage is shown here, with one card below."}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <span className="font-label-md text-label-md font-semibold text-primary">
                      {contest?.reward ?? "Reward announced soon"}
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary">{contest?.endsLabel ?? ""}</span>
                  </div>
                </div>
              </a>
              {contest ? (
                <div className="pointer-events-none absolute -top-5 -left-6 flex items-center gap-space-sm rounded-lg bg-primary-container p-space-sm text-on-primary shadow-lg">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
                    <Icon name="workspace_premium" className="text-[18px]" />
                  </div>
                  <div>
                    <p className="font-label-sm text-label-sm text-tertiary-fixed uppercase">Featured</p>
                    <p className="font-label-md text-label-md font-bold">
                      {contest.status === "closed" ? "Registrations closed" : "Registrations open"}
                    </p>
                  </div>
                </div>
              ) : null}
              {contest ? (
                <div className="pointer-events-none absolute -right-4 -bottom-6 hidden max-w-[220px] items-center gap-space-sm rounded-lg bg-surface-container-lowest p-space-sm shadow-xl sm:flex">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-tertiary-fixed text-on-tertiary-fixed">
                    <Icon name={contest.rewardIcon || "emoji_events"} filled className="text-[22px]" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-label-sm text-label-sm font-bold text-secondary">Reward</span>
                    <p className="font-label-md text-label-md truncate font-bold text-primary">{contest.fee}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
