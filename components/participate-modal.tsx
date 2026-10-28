"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import { submitEntry, type EntryState } from "@/app/actions/entries";
import { Icon } from "@/components/icon";
import { emailError } from "@/lib/validation";

export type ModalContest = {
  slug: string;
  title: string;
  categoryLabel: string;
  reward: string;
  fee: string;
  deadline: string;
};

const initialState: EntryState = null;

function EntryForm({ contest }: { contest: ModalContest }) {
  const [state, formAction, pending] = useActionState(submitEntry, initialState);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [nameMessage, setNameMessage] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const name = String(data.get("participantName") ?? "").trim();
    const invalidName =
      name.length < 2 || name.length > 120 ? "Enter the participant's full name." : null;
    const invalidEmail = emailError(String(data.get("email") ?? ""));
    setNameMessage(invalidName);
    setEmailMessage(invalidEmail);
    if (invalidName || invalidEmail) event.preventDefault();
  }

  if (state?.ok) {
    return (
      <p className="font-body-md text-body-md rounded-lg bg-surface-container-low p-space-md text-primary">
        {state.message}
      </p>
    );
  }

  return (
    <form className="flex flex-col gap-space-sm" action={formAction} noValidate onSubmit={onSubmit}>
      <input type="hidden" name="contestSlug" value={contest.slug} />
      <input type="hidden" name="contestTitle" value={contest.title} />
      <div>
        <label
          className="font-label-sm text-label-sm mb-1 block text-primary"
          htmlFor={`${contest.slug}-name`}
        >
          Participant Full Name
        </label>
        <input
          id={`${contest.slug}-name`}
          name="participantName"
          required
          type="text"
          placeholder="e.g. Maya Iyer"
          minLength={2}
          maxLength={120}
          aria-invalid={nameMessage ? true : undefined}
          className="font-body-md text-body-md w-full rounded-lg bg-surface px-3 py-2 text-on-surface shadow-sm outline-none focus:bg-surface-container-lowest"
        />
        {nameMessage ? (
          <p className="font-body-sm text-body-sm mt-1 text-error">{nameMessage}</p>
        ) : null}
      </div>
      <div>
        <label
          className="font-label-sm text-label-sm mb-1 block text-primary"
          htmlFor={`${contest.slug}-email`}
        >
          Email Address
        </label>
        <input
          id={`${contest.slug}-email`}
          name="email"
          required
          type="email"
          placeholder="maya@example.com"
          maxLength={160}
          aria-invalid={emailMessage ? true : undefined}
          className="font-body-md text-body-md w-full rounded-lg bg-surface px-3 py-2 text-on-surface shadow-sm outline-none focus:bg-surface-container-lowest"
        />
        {emailMessage ? (
          <p className="font-body-sm text-body-sm mt-1 text-error">{emailMessage}</p>
        ) : null}
      </div>
      {state?.message ? (
        <p className="font-body-sm text-body-sm text-error">{state.message}</p>
      ) : null}
      <button
        className="font-label-lg text-label-lg mt-2 w-full rounded-lg bg-primary-container py-3 font-bold text-on-primary shadow-md transition-colors hover:bg-secondary disabled:opacity-70"
        type="submit"
        disabled={pending}
      >
        {pending ? "Saving entry..." : "Confirm Free Participation"}
      </button>
    </form>
  );
}

export function ParticipateModal({
  contest,
  onClose,
}: {
  contest: ModalContest | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!contest) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [contest, onClose]);

  if (!contest) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-primary/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${contest.slug}-title`}
    >
      <div className="relative flex w-full max-w-lg flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-2xl">
        <button
          aria-label="Close modal"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-primary transition-colors hover:bg-surface-container-high"
          type="button"
          onClick={onClose}
        >
          <Icon name="close" className="text-[20px]" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-label-sm text-label-sm rounded-full bg-surface-container px-2.5 py-1 font-bold text-secondary">
            {contest.categoryLabel}
          </span>
          <span className="font-label-sm text-label-sm rounded-full bg-tertiary-fixed px-2 py-0.5 font-bold text-on-tertiary-fixed">
            {contest.fee}
          </span>
        </div>
        <h3 id={`${contest.slug}-title`} className="font-headline-lg text-headline-lg text-primary">
          {contest.title}
        </h3>
        <div className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-space-md">
          <div className="flex items-center justify-between text-base">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Prize Package:
            </span>
            <span className="font-label-md text-label-md font-bold text-primary">
              {contest.reward}
            </span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Submission Deadline:
            </span>
            <span className="font-label-md text-label-md font-bold text-secondary">
              {contest.deadline}
            </span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="font-label-md text-label-md text-on-surface-variant">
              Jury Panel:
            </span>
            <span className="font-label-md text-label-md font-bold text-primary">
              3 Certified Adjudicators
            </span>
          </div>
        </div>

        <EntryForm key={contest.slug} contest={contest} />
        <p className="font-label-sm text-label-sm text-center text-on-surface-variant">
          By participating you agree to Rising Star Fair Play Guidelines.
        </p>
      </div>
    </div>
  );
}
