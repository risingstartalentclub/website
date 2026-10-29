import Link from "next/link";
import { contests, type Contest } from "@/lib/content";
import { Icon } from "@/components/icon";
import { participateHref } from "@/lib/parent-panel";

export function CompetitionsSection({
  items,
  featured = false,
  signedIn = false,
  eyebrow = "WHAT'S HAPPENING NOW",
  heading,
  intro,
}: {
  items?: Contest[];
  featured?: boolean;
  signedIn?: boolean;
  eyebrow?: string;
  heading?: string;
  intro?: string;
}) {
  const source = items ?? (featured ? [] : contests);
  const shown = featured ? source.filter((contest) => contest.isHero).slice(0, 1) : source;

  return (
    <section className="w-full scroll-mt-20 bg-surface-container-low py-space-xl" id="competitions">
      <div className="mx-auto max-w-[1280px] px-margin-mobile md:px-margin">
        <div className="mb-space-lg flex flex-col justify-between gap-space-md md:flex-row md:items-end">
          <div>
            <div className="font-label-sm text-label-sm mb-space-xs inline-flex items-center gap-space-xs rounded-full border border-tertiary-fixed-dim/40 bg-tertiary-fixed/35 px-3 py-1 font-bold tracking-widest text-tertiary-container uppercase shadow-sm">
              <Icon name="stars" filled className="text-[15px] text-tertiary-container" />
              {eyebrow}
            </div>
            <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl tracking-tight text-primary">
              {heading ?? (featured ? "Featured Contest" : "Discover Exciting Contests")}
            </h2>
            <p className="font-body-md text-body-md mt-1 max-w-2xl text-on-surface-variant">
              {intro ??
                (featured
                  ? "The contest chosen for the homepage is the one families can enter from here."
                  : "From festive celebrations to creative challenges, find your moment to shine with Rising Star Talent Club.")}
            </p>
          </div>
          {featured ? (
            <Link
              href="/competitions"
              className="font-label-lg text-label-lg group inline-flex items-center gap-1.5 self-start font-semibold text-secondary transition-colors hover:text-primary md:self-auto"
            >
              <span>Explore All Contests</span>
              <Icon
                name="arrow_forward"
                className="text-[18px] transition-transform group-hover:translate-x-1"
              />
            </Link>
          ) : null}
        </div>

        <div
          className={
            featured || shown.length === 1
              ? "mx-auto grid max-w-xl grid-cols-1"
              : "grid grid-cols-1 gap-gutter md:grid-cols-2"
          }
        >
          {shown.length === 0 ? (
            featured ? (
              <article className="overflow-hidden rounded-xl border border-dashed border-outline-variant/80 bg-surface-container-lowest shadow-sm">
                <div className="flex aspect-[16/10] items-center justify-center bg-surface-container">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed">
                    <Icon name="emoji_events" className="text-[32px]" />
                  </div>
                </div>
                <div className="p-space-lg text-center">
                  <h3 className="font-headline-md text-headline-md tracking-tight text-primary">
                    Featured contest coming soon
                  </h3>
                  <p className="font-body-md text-body-md mt-1.5 text-on-surface-variant">
                    When a contest is chosen for the homepage, it will appear in this spot.
                  </p>
                </div>
              </article>
            ) : (
              <div className="rounded-xl bg-surface-container-lowest p-space-lg text-center shadow-sm md:col-span-2">
                <h3 className="font-headline-sm text-headline-sm text-primary">No open contests yet.</h3>
                <p className="font-body-md text-body-md mt-1 text-on-surface-variant">
                  Autumn & Festive Season 2026 contests will appear here.
                </p>
              </div>
            )
          ) : (
            shown.map((contest) => (
              <article
                key={contest.slug}
                className="group flex flex-col overflow-hidden rounded-xl border border-surface-variant/60 bg-surface-container-lowest shadow-md transition-all duration-300 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-container">
                  {contest.image ? (
                    <img
                      src={contest.image}
                      alt={contest.imageAlt}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {contest.isHero && !featured ? (
                      <span className="font-label-sm text-label-sm rounded-full bg-tertiary-fixed px-2.5 py-1 font-bold text-on-tertiary-fixed shadow-sm">
                        Homepage
                      </span>
                    ) : null}
                    <span className="font-label-sm text-label-sm flex items-center gap-1 rounded-full bg-surface-container-lowest/95 px-2.5 py-1 font-bold text-[#0d5c3a] shadow-sm backdrop-blur-sm">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#1b8755]" />
                      {contest.status === "closed" ? "Registrations Closed" : "Registrations Open"}
                    </span>
                  </div>
                  <div className="absolute right-3 bottom-3">
                    <span className="font-label-sm text-label-sm rounded-full bg-primary-container/90 px-2.5 py-1 text-on-primary shadow-sm backdrop-blur-sm">
                      {contest.fee}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-between p-space-lg">
                  <div>
                    <div
                      className={`font-label-sm text-label-sm mb-1 flex items-center gap-space-xs font-semibold ${contest.endsUrgent ? "text-error" : "text-secondary"}`}
                    >
                      <Icon
                        name={contest.endsUrgent ? "schedule" : "calendar_today"}
                        className="text-[15px]"
                      />
                      <span>{contest.endsLabel}</span>
                    </div>
                    {contest.categoryLabel ? (
                      <p className="font-label-sm text-label-sm mt-1 text-secondary">{contest.categoryLabel}</p>
                    ) : null}
                    <h3 className="font-headline-md text-headline-md tracking-tight text-primary">
                      {contest.title}
                    </h3>
                    <p className="font-body-md text-body-md mt-1.5 leading-relaxed text-on-surface-variant">
                      {contest.description}
                    </p>
                  </div>
                  <div className="mt-space-md mb-space-md rounded-lg border border-surface-variant/40 bg-surface-container-low p-space-sm pt-space-sm">
                    <span className="font-label-sm text-label-sm block font-semibold tracking-wider text-on-surface-variant uppercase">
                      Reward & Trophy
                    </span>
                    <span className="font-label-lg text-label-lg mt-0.5 flex items-center gap-1.5 font-bold text-primary">
                      <Icon
                        name={contest.rewardIcon}
                        filled
                        className="text-[18px] text-tertiary-container"
                      />
                      {contest.reward}
                    </span>
                  </div>
                  <div>
                    {contest.status === "closed" ? null : (
                      <Link
                        href={participateHref(contest.slug, signedIn)}
                        className="font-label-md text-label-md group flex items-center justify-center gap-1.5 rounded-lg bg-primary-container px-space-sm py-3 text-center font-bold text-on-primary shadow-md transition-colors hover:bg-secondary"
                      >
                        <span>Participate Now</span>
                        <Icon
                          name="arrow_forward"
                          className="text-[16px] transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {featured ? (
          <div className="mt-space-xl text-center">
            <Link
              href="/competitions"
              className="font-label-lg text-label-lg group inline-flex items-center gap-2 rounded-lg border border-outline-variant/60 bg-surface-container-lowest px-space-xl py-3 font-semibold text-primary shadow-sm transition-all hover:bg-surface-container hover:shadow-md"
            >
              <span>Explore All Contests (Active, Upcoming & Past)</span>
              <Icon
                name="arrow_forward"
                className="text-[18px] text-secondary transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
