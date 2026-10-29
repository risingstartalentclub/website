"use client";

import { useActionState, useEffect } from "react";
import { announceWinners, type ResultState } from "@/app/actions/results";
import { Icon } from "@/components/icon";

export type ContestEntryRow = {
  id: string;
  contestSlug: string;
  name: string;
  age: number | null;
  gender: string | null;
  instagramUrl: string | null;
  winner: boolean;
};

export function WinnerPicker({
  contestTitle,
  contestSlug,
  entries,
  announced,
  ready,
  onClose,
}: {
  contestTitle: string;
  contestSlug: string;
  entries: ContestEntryRow[];
  announced: boolean;
  ready: boolean;
  onClose: () => void;
}) {
  const [state, action, pending] = useActionState<ResultState, FormData>(announceWinners, null);

  useEffect(() => {
    if (state?.message) onClose();
  }, [onClose, state?.message]);

  useEffect(() => {
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
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-primary/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="winner-picker-title">
      <form action={action} className="flex max-h-[calc(100dvh-2rem)] w-full max-w-xl flex-col gap-4 overflow-y-auto rounded-xl bg-surface-container-lowest p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="winner-picker-title" className="font-headline-sm text-headline-sm text-primary">
              Choose winners
            </h2>
            <p className="font-body-sm text-body-sm mt-1 text-on-surface-variant">{contestTitle}</p>
          </div>
          <button type="button" aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-primary" onClick={onClose}>
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>
        <input type="hidden" name="contestSlug" value={contestSlug} />
        {announced ? (
          <p className="font-body-sm text-body-sm rounded-lg bg-tertiary-fixed px-3 py-2 text-on-tertiary-fixed">
            Results are already visible to parents. Saving again replaces the winner selection.
          </p>
        ) : (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Select who won. Every other child in this contest will see Better luck next time.
          </p>
        )}
        {!ready ? (
          <p className="font-body-sm text-body-sm text-error">
            Run supabase/4-participants.sql in the Supabase SQL editor, then open this list again.
          </p>
        ) : entries.length === 0 ? (
          <p className="font-body-md text-body-md text-on-surface-variant">No one has entered this contest yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <li key={entry.id}>
                <label className="flex items-start gap-3 rounded-lg bg-surface-container-low p-3">
                  <input type="checkbox" name="winnerId" value={entry.id} defaultChecked={entry.winner} className="mt-1" />
                  <span>
                    <span className="font-body-md text-body-md block font-semibold text-primary">{entry.name}</span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {entry.age !== null ? `Age ${entry.age}` : "Age not saved"}
                      {entry.gender === "boy" ? " · Boy" : entry.gender === "girl" ? " · Girl" : ""}
                    </span>
                    {entry.instagramUrl ? (
                      <a href={entry.instagramUrl} target="_blank" rel="noopener noreferrer" className="font-label-sm text-label-sm mt-1 block text-secondary">
                        Instagram profile
                      </a>
                    ) : null}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
        {state?.error ? <p className="font-body-sm text-body-sm text-error">{state.error}</p> : null}
        <button
          type="submit"
          disabled={pending || !ready || entries.length === 0}
          className="font-label-md text-label-md w-fit rounded-lg bg-primary-container px-4 py-2 font-bold text-on-primary disabled:opacity-70"
        >
          {pending ? "Saving..." : "Save winners"}
        </button>
      </form>
    </div>
  );
}
