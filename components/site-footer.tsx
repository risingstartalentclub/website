import Link from "next/link";
import { Suspense } from "react";
import { getSiteImages } from "@/lib/get-site-images";
import { Icon } from "@/components/icon";

const columns = [
  {
    title: "Quick Links",
    links: [
      { href: "/", label: "Home" },
      { href: "/competitions", label: "Competitions" },
      { href: "/winners", label: "Winners" },
      { href: "/why-us", label: "About Us" },
      { href: "/contact", label: "Contact Us" },
    ],
  },
  {
    title: "Participant Support",
    links: [
      { href: "/how-it-works", label: "How It Works" },
      { href: "/faqs", label: "FAQs" },
      { href: "/registration-help", label: "Registration Help" },
      { href: "/contact", label: "Contact Support" },
    ],
  },
  {
    title: "Legal & Compliance",
    links: [
      { href: "/terms", label: "Terms and Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/rules", label: "Competition Rules" },
      { href: "/refund", label: "Refund & Cancellation Policy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <Suspense fallback={<FooterView logo="" />}>
      <LiveFooter />
    </Suspense>
  );
}

async function LiveFooter() {
  const images = await getSiteImages();
  return <FooterView logo={images.logo} />;
}

function FooterView({ logo }: { logo: string }) {
  return (
    <footer className="w-full bg-primary-container text-surface-variant">
      <div className="mx-auto max-w-[1280px] px-5 pt-space-xl pb-space-lg md:px-margin">
        <div className="grid grid-cols-1 gap-gutter pb-space-xl md:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col gap-space-md lg:col-span-4">
            <div className="flex items-center gap-space-sm">
              <div className="inline-block rounded-lg bg-surface-container-lowest/95 p-1.5 shadow-sm">
                {logo ? (
                  <img
                    alt="Rising Star Talent Club Logo"
                    className="h-9 w-auto object-contain"
                    src={logo}
                    style={{ mixBlendMode: "multiply" }}
                  />
                ) : (
                  <span className="block h-9 w-9" />
                )}
              </div>
              <span className="font-headline-sm text-headline-sm text-on-primary">
                Rising Star Talent Club
              </span>
            </div>
            <p className="font-body-md text-body-md max-w-sm text-surface-container-highest">
              The premier family-friendly contest platform celebrating the
              creativity, culture, and achievements of babies, kids, teens, and
              youth.
            </p>
          </div>

          {columns.map((column, index) => (
            <div
              key={column.title}
              className={index === 0 ? "lg:col-span-2" : "lg:col-span-3"}
            >
              <h2 className="font-label-lg text-label-lg mb-space-md tracking-wider text-tertiary-fixed-dim uppercase">
                {column.title}
              </h2>
              <nav className="flex flex-col gap-space-sm">
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="font-body-sm text-body-sm text-surface-variant transition-colors hover:text-on-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-space-sm rounded-lg bg-primary/40 px-space-md py-space-sm md:flex-row">
          <p className="font-body-sm text-body-sm text-surface-container-highest">
            © 2024 Rising Star Talent Club. All rights reserved.
          </p>
          <div className="flex items-center gap-space-md">
            <span className="font-label-sm text-label-sm flex items-center gap-1 text-tertiary-fixed-dim">
              <Icon name="verified" className="text-[14px]" />
              National Accreditation
            </span>
            <span className="font-label-sm text-label-sm text-surface-container-highest">
              Excellence in Arts & Performance
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
