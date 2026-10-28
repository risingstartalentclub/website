import Link from "next/link";
import { Icon } from "@/components/icon";

const steps = [
  {
    number: "1",
    label: "Step 01",
    icon: "person_add",
    title: "Join Rising Star Talent Club",
    body: "Create an account with easy parent or guardian guidance for younger participants.",
    gold: false,
  },
  {
    number: "2",
    label: "Step 02",
    icon: "search",
    title: "Find Your Favorite Contest",
    body: "Explore exciting contests and check the participation rules.",
    gold: false,
  },
  {
    number: "3",
    label: "Step 03",
    icon: "upload_file",
    title: "Register & Participate",
    body: "Complete simple registration and submit photos, videos, or artwork per guidelines.",
    gold: false,
  },
  {
    number: "4",
    label: "Step 04",
    icon: "emoji_events",
    title: "Celebrate Your Moment",
    body: "Showcase creativity and earn verified digital certificates, trophies, and rewards.",
    gold: true,
  },
];

export function HowItWorksSection() {
  return (
    <section
      className="relative w-full scroll-mt-20 overflow-hidden bg-surface-container-lowest py-24"
      id="how-it-works"
    >
      <div className="mx-auto max-w-[1280px] px-margin-mobile md:px-margin">
        <div className="mx-auto mb-space-xl max-w-2xl text-center">
          <span className="font-label-sm text-label-sm mb-space-xs block font-bold tracking-widest text-secondary uppercase">
            Simple 4-Step Process
          </span>
          <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary">
            How It Works
          </h2>
          <p className="font-body-md text-body-md mt-2 text-on-surface-variant">
            Your pathway from discovery to national celebration is designed to
            be smooth, transparent, and encouraging.
          </p>
        </div>
        <div className="relative grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col items-start rounded-xl bg-surface-container-low p-space-lg transition-shadow hover:shadow-md"
            >
              <div className="mb-space-md flex w-full items-center justify-between">
                <span
                  className={`font-headline-sm text-headline-sm flex h-10 w-10 items-center justify-center rounded-full ${step.gold ? "bg-tertiary-container text-tertiary-fixed" : "bg-primary-container text-on-primary"}`}
                >
                  {step.number}
                </span>
                <span
                  className={`font-label-sm text-label-sm rounded-full px-2.5 py-1 font-bold ${step.gold ? "bg-tertiary-fixed text-on-tertiary-container" : "bg-surface-container text-secondary"}`}
                >
                  {step.label}
                </span>
              </div>
              <div
                className={`mb-space-md flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-lowest shadow-sm ${step.gold ? "text-tertiary-container" : "text-secondary"}`}
              >
                <Icon name={step.icon} className="text-[28px]" />
              </div>
              <h3 className="font-headline-sm text-headline-sm mb-space-xs text-primary">
                {step.title}
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {step.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-space-xl flex flex-col items-center justify-between gap-space-md rounded-xl bg-surface-container p-space-lg sm:flex-row">
          <div className="flex items-center gap-space-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary">
              <Icon name="family_restroom" className="text-[24px]" />
            </div>
            <div>
              <h4 className="font-headline-sm text-headline-sm text-primary">
                Parent or guardian assistance needed for registration?
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Our support team is here to help with submission guidelines and
                child safety standards.
              </p>
            </div>
          </div>
          <Link
            className="font-label-md text-label-md rounded-lg bg-primary px-space-md py-3 whitespace-nowrap text-on-primary shadow-sm transition-colors hover:bg-secondary"
            href="/registration-help"
          >
            Registration Help
          </Link>
        </div>
      </div>
    </section>
  );
}
