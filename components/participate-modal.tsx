"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { submitEntry, type EntryState } from "@/app/actions/entries";
import { Icon } from "@/components/icon";
import { ageError, genderError, instagramError } from "@/lib/validation";

export type ModalContest = {
  slug: string;
  title: string;
  categoryLabel: string;
  reward: string;
  fee: string;
  deadline: string;
  participationMessage?: string;
};

export type SavedChild = {
  id: string;
  fullName: string;
  age: number;
  gender: "boy" | "girl";
  instagramUrl: string;
};

const initialState: EntryState = null;
const fieldClass =
  "font-body-md text-body-md w-full rounded-lg bg-surface px-3 py-2 text-on-surface shadow-sm outline-none focus:bg-surface-container-lowest";

function EntryRound({
  contest,
  savedChildren,
  startNew,
  onAnother,
}: {
  contest: ModalContest;
  savedChildren: SavedChild[];
  startNew: boolean;
  onAnother: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitEntry, initialState);
  const [mode, setMode] = useState<"saved" | "new">(startNew || savedChildren.length === 0 ? "new" : "saved");
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    age?: string;
    gender?: string;
    instagram?: string;
  }>({});

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [router, state?.ok]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (mode === "saved") {
      setFieldErrors({});
      return;
    }
    const data = new FormData(event.currentTarget);
    const fullName = String(data.get("fullName") ?? "").trim();
    const next = {
      fullName: fullName.length < 2 || fullName.length > 120 ? "Enter the full name for the certificate." : undefined,
      age: ageError(String(data.get("age") ?? "")) ?? undefined,
      gender: genderError(String(data.get("gender") ?? "")) ?? undefined,
      instagram: instagramError(String(data.get("instagramUrl") ?? ""), true) ?? undefined,
    };
    setFieldErrors(next);
    if (next.fullName || next.age || next.gender || next.instagram) event.preventDefault();
  }

  if (state?.ok) {
    const instruction = state.instruction || contest.participationMessage || "";
    return (
      <div className="flex flex-col gap-space-sm">
        <div className="rounded-lg bg-surface-container-low p-space-md">
          <p className="font-headline-sm text-headline-sm text-primary">Thank you</p>
          <p className="font-body-md text-body-md mt-2 text-primary">{state.message}</p>
          {instruction ? (
            <p className="font-body-md text-body-md mt-3 whitespace-pre-wrap text-on-surface">{instruction}</p>
          ) : null}
        </div>
        <button
          type="button"
          className="font-label-lg text-label-lg w-full rounded-lg bg-surface-container px-space-sm py-3 font-bold text-primary"
          onClick={onAnother}
        >
          Add another child
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-space-sm" action={formAction} noValidate onSubmit={onSubmit}>
      <input type="hidden" name="contestSlug" value={contest.slug} />
      {mode === "saved" ? (
        <div>
          <label className="font-label-sm text-label-sm mb-1 block text-primary" htmlFor={`${contest.slug}-child`}>
            Choose a child
          </label>
          <select id={`${contest.slug}-child`} name="participantId" className={fieldClass} defaultValue={savedChildren[0]?.id}>
            {savedChildren.map((child) => (
              <option key={child.id} value={child.id}>
                {child.fullName} · {child.age} · {child.gender === "boy" ? "Boy" : "Girl"}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="font-label-md text-label-md mt-2 font-semibold text-secondary"
            onClick={() => setMode("new")}
          >
            Add another child
          </button>
        </div>
      ) : (
        <>
          {savedChildren.length > 0 ? (
            <button
              type="button"
              className="font-label-md text-label-md self-start font-semibold text-secondary"
              onClick={() => setMode("saved")}
            >
              Choose a saved child
            </button>
          ) : null}
          <div>
            <label className="font-label-sm text-label-sm mb-1 block text-primary" htmlFor={`${contest.slug}-name`}>
              Full name for certificate
            </label>
            <input
              id={`${contest.slug}-name`}
              name="fullName"
              required
              type="text"
              minLength={2}
              maxLength={120}
              aria-invalid={fieldErrors.fullName ? true : undefined}
              className={fieldClass}
            />
            {fieldErrors.fullName ? <p className="font-body-sm text-body-sm mt-1 text-error">{fieldErrors.fullName}</p> : null}
          </div>
          <div className="grid grid-cols-2 gap-space-sm">
            <div>
              <label className="font-label-sm text-label-sm mb-1 block text-primary" htmlFor={`${contest.slug}-age`}>
                Age
              </label>
              <input
                id={`${contest.slug}-age`}
                name="age"
                required
                type="number"
                min={0}
                max={21}
                inputMode="numeric"
                aria-invalid={fieldErrors.age ? true : undefined}
                className={fieldClass}
              />
              {fieldErrors.age ? <p className="font-body-sm text-body-sm mt-1 text-error">{fieldErrors.age}</p> : null}
            </div>
            <fieldset>
              <legend className="font-label-sm text-label-sm mb-1 text-primary">Boy / Girl</legend>
              <div className="flex gap-3 py-2">
                <label className="font-body-md text-body-md flex items-center gap-1.5 text-on-surface">
                  <input type="radio" name="gender" value="boy" required />
                  Boy
                </label>
                <label className="font-body-md text-body-md flex items-center gap-1.5 text-on-surface">
                  <input type="radio" name="gender" value="girl" required />
                  Girl
                </label>
              </div>
              {fieldErrors.gender ? <p className="font-body-sm text-body-sm text-error">{fieldErrors.gender}</p> : null}
            </fieldset>
          </div>
          <div>
            <label className="font-label-sm text-label-sm mb-1 block text-primary" htmlFor={`${contest.slug}-instagram`}>
              Instagram profile URL
            </label>
            <input
              id={`${contest.slug}-instagram`}
              name="instagramUrl"
              required
              type="url"
              placeholder="https://instagram.com/name"
              maxLength={300}
              aria-invalid={fieldErrors.instagram ? true : undefined}
              className={fieldClass}
            />
            {fieldErrors.instagram ? (
              <p className="font-body-sm text-body-sm mt-1 text-error">{fieldErrors.instagram}</p>
            ) : null}
          </div>
        </>
      )}
      {state?.message ? <p className="font-body-sm text-body-sm text-error">{state.message}</p> : null}
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
  children = [],
  onClose,
}: {
  contest: ModalContest | null;
  children?: SavedChild[];
  onClose: () => void;
}) {
  const [round, setRound] = useState(0);

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
      <div className="relative flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col gap-space-md overflow-y-auto rounded-xl bg-surface-container-lowest p-space-lg shadow-2xl">
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
        <h3 id={`${contest.slug}-title`} className="font-headline-lg text-headline-lg pr-8 text-primary">
          {contest.title}
        </h3>
        <div className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-space-md">
          <div className="flex items-center justify-between text-base">
            <span className="font-label-md text-label-md text-on-surface-variant">Prize Package:</span>
            <span className="font-label-md text-label-md font-bold text-primary">{contest.reward}</span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="font-label-md text-label-md text-on-surface-variant">Submission Deadline:</span>
            <span className="font-label-md text-label-md font-bold text-secondary">{contest.deadline}</span>
          </div>
        </div>

        <EntryRound
          key={round}
          contest={contest}
          savedChildren={children}
          startNew={round > 0}
          onAnother={() => setRound((value) => value + 1)}
        />
        <p className="font-label-sm text-label-sm text-center text-on-surface-variant">
          By participating you agree to Rising Star Fair Play Guidelines.
        </p>
      </div>
    </div>
  );
}
