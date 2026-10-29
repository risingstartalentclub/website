"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { announceWinners, type ResultState } from "@/app/actions/results";

export type ContestEntryRow = {
  id: string;
  contestSlug: string;
  name: string;
  age: number | null;
  gender: string | null;
  instagramUrl: string | null;
  winner: boolean;
};

export function ContestParticipants({
  contestSlug,
  entries,
  announced,
  ready,
}: {
  contestSlug: string;
  entries: ContestEntryRow[];
  announced: boolean;
  ready: boolean;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState<ResultState, FormData>(announceWinners, null);

  useEffect(() => {
    if (state?.message) router.refresh();
  }, [router, state?.message]);

  return (
    <form action={action} className="flex flex-col gap-4">
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
          Run supabase/4-participants.sql in the Supabase SQL editor, then open this contest again.
        </p>
      ) : entries.length === 0 ? (
        <p className="font-body-md text-body-md rounded-xl bg-surface-container-lowest p-6 text-on-surface-variant shadow-sm">
          No one has entered this contest yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead className="bg-surface-container-low">
              <tr>
                {["Winner", "Participant", "Age", "Boy / Girl", "Instagram"].map((heading) => (
                  <th key={heading} className="font-label-sm text-label-sm px-4 py-3 text-on-surface-variant uppercase">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-t border-surface-variant/70">
                  <td className="px-4 py-3">
                    <input type="checkbox" name="winnerId" value={entry.id} defaultChecked={entry.winner} aria-label={`Mark ${entry.name} as a winner`} />
                  </td>
                  <td className="font-body-md text-body-md px-4 py-3 font-semibold text-primary">{entry.name}</td>
                  <td className="font-body-sm text-body-sm px-4 py-3 text-on-surface">{entry.age !== null ? entry.age : "—"}</td>
                  <td className="font-body-sm text-body-sm px-4 py-3 text-on-surface">
                    {entry.gender === "boy" ? "Boy" : entry.gender === "girl" ? "Girl" : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {entry.instagramUrl ? (
                      <a href={entry.instagramUrl} target="_blank" rel="noopener noreferrer" className="font-label-sm text-label-sm text-secondary">
                        Profile
                      </a>
                    ) : (
                      <span className="font-body-sm text-body-sm text-on-surface-variant">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {state?.error ? <p className="font-body-sm text-body-sm text-error">{state.error}</p> : null}
      {state?.message ? <p className="font-body-sm text-body-sm text-primary">{state.message}</p> : null}
      <button
        type="submit"
        disabled={pending || !ready || entries.length === 0}
        className="font-label-md text-label-md w-fit rounded-lg bg-primary-container px-4 py-2 font-bold text-on-primary disabled:opacity-70"
      >
        {pending ? "Saving..." : "Save winners"}
      </button>
    </form>
  );
}
