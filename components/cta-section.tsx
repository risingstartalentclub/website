"use client";

import { useState } from "react";
import { clubRegistration } from "@/lib/content";
import { Icon } from "@/components/icon";
import { ParticipateModal, type ModalContest } from "@/components/participate-modal";

export function CtaSection() {
  const [open, setOpen] = useState(false);
  const contest: ModalContest = {
    slug: clubRegistration.slug,
    title: clubRegistration.title,
    categoryLabel: clubRegistration.categoryLabel,
    reward: clubRegistration.reward,
    fee: clubRegistration.fee,
    deadline: clubRegistration.deadline,
  };

  return (
    <section className="w-full bg-surface-container-low py-space-xl">
      <div className="mx-auto max-w-[1280px] px-margin-mobile md:px-margin">
        <div className="relative overflow-hidden rounded-xl bg-primary-container p-space-xl text-on-primary shadow-2xl md:p-20">
          <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-secondary/30 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-10 h-80 w-80 rounded-full bg-tertiary-fixed/15 blur-2xl" />
          <div className="relative z-10 flex max-w-3xl flex-col gap-space-md">
            <div className="font-label-sm text-label-sm inline-flex items-center gap-space-xs self-start rounded-full bg-primary/60 px-3 py-1 text-tertiary-fixed backdrop-blur-md">
              <Icon name="stars" className="text-[16px]" />
              Join 2,400+ Young Creators Today
            </div>
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg tracking-tight text-on-primary">
              Every Young Star Deserves a Chance to Shine.
            </h2>
            <p className="font-body-lg text-body-lg max-w-xl text-surface-container-highest">
              Discover a world of creativity, fun, and exciting contests. Find
              your next contest and celebrate your unique talent with Rising
              Star Talent Club.
            </p>
            <div className="flex flex-col items-stretch gap-space-md pt-space-sm sm:flex-row sm:items-center">
              <a
                className="font-label-lg text-label-lg inline-flex items-center justify-center gap-space-sm rounded-lg bg-tertiary-fixed px-space-xl py-4 font-bold text-on-tertiary-fixed shadow-lg transition-colors hover:bg-tertiary-fixed-dim"
                href="#competitions"
              >
                <span>Explore Contests</span>
                <Icon name="arrow_forward" className="text-[18px]" />
              </a>
              <button
                type="button"
                className="font-label-lg text-label-lg inline-flex items-center justify-center gap-space-sm rounded-lg bg-surface-container-lowest px-space-lg py-4 text-primary shadow-md transition-colors hover:bg-surface-container"
                onClick={() => setOpen(true)}
              >
                <Icon name="person_add" className="text-[20px] text-secondary" />
                <span>Create Free Account</span>
              </button>
            </div>
            <div className="font-label-sm text-label-sm flex flex-wrap items-center gap-space-md pt-space-xs text-surface-container-high">
              {[
                "No Hidden Registration Fees",
                "Verified E-Certificates",
                "Ages 1–20 Welcome",
              ].map((item) => (
                <span key={item} className="flex items-center gap-1">
                  <Icon
                    name="check_circle"
                    className="text-[16px] text-tertiary-fixed"
                  />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <ParticipateModal contest={open ? contest : null} onClose={() => setOpen(false)} />
    </section>
  );
}
