import { Icon } from "@/components/icon";

const reasons = [
  {
    icon: "diversity_1",
    title: "Contests for Different Age Groups",
    body: "Tailored, age-appropriate contest brackets for babies (1-3), kids (4-8), pre-teens (9-13), and teens & youth (14-20).",
    link: "Age brackets 1–20",
    gold: false,
  },
  {
    icon: "celebration",
    title: "Celebrate Creativity & Fun",
    body: "A welcoming, joyful stage for young minds to express their ideas, styling, and natural talents without pressure.",
    link: "Joyful encouragement",
    gold: false,
  },
  {
    icon: "workspace_premium",
    title: "Recognition & Rewards",
    body: "Celebrate milestones with genuine trophies, verified digital certificates of excellence, and feature honors.",
    link: "Hall of Young Stars",
    gold: true,
  },
  {
    icon: "verified_user",
    title: "Family-Friendly & Trustworthy",
    body: "Transparent rules, respectful parent/guardian involvement, secure entry submissions, and caring community moderation.",
    link: "Safe & verified platform",
    gold: false,
  },
];

export function WhySection() {
  return (
    <section className="w-full scroll-mt-20 bg-surface-container-low py-space-xl" id="why-us">
      <div className="mx-auto max-w-[1280px] px-margin-mobile md:px-margin">
        <div className="mx-auto mb-space-xl max-w-2xl text-center">
          <span className="font-label-sm text-label-sm mb-space-xs block font-bold tracking-widest text-secondary uppercase">
            Unmatched Standards
          </span>
          <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary">
            Why Choose Rising Star Talent Club?
          </h2>
          <p className="font-body-md text-body-md mt-2 text-on-surface-variant">
            An authentic, credible, and supportive platform built specifically
            to nurture and spotlight real creative achievements.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="flex flex-col justify-between rounded-xl bg-surface-container-lowest p-space-xl shadow-sm transition-all hover:shadow-md"
            >
              <div>
                <div
                  className={`mb-space-md flex h-12 w-12 items-center justify-center rounded-lg ${reason.gold ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-surface-container text-secondary"}`}
                >
                  <Icon name={reason.icon} className="text-[28px]" />
                </div>
                <h3 className="font-headline-sm text-headline-sm mb-space-xs text-primary">
                  {reason.title}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {reason.body}
                </p>
              </div>
              <div
                className={`font-label-sm text-label-sm mt-space-md flex items-center gap-1 pt-space-sm font-semibold ${reason.gold ? "text-tertiary-container" : "text-secondary"}`}
              >
                <span>{reason.link}</span>
                <Icon name="arrow_forward" className="text-[16px]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
