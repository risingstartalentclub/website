"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteContest, saveContest, type ContestState } from "@/app/actions/contests";
import { ContestParticipants, type ContestEntryRow } from "@/components/admin-winners";
import { Icon } from "@/components/icon";
import { adminPath } from "@/lib/admin-path";
import type { Contest } from "@/lib/content";

const fieldClass =
  "font-body-sm text-body-sm w-full rounded-lg bg-surface px-3 py-2 text-on-surface shadow-sm outline-none";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function ContestEditor({ contest, onClose }: { contest: Contest | null; onClose: () => void }) {
  const [state, action, pending] = useActionState<ContestState, FormData>(saveContest, null);
  const [removeState, remove, removing] = useActionState<ContestState, FormData>(deleteContest, null);
  const [viewing, setViewing] = useState(false);
  const [pickedUrl, setPickedUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const current = contest;
  const preview = pickedUrl || current?.image || "";

  useEffect(() => {
    if (state?.message || removeState?.message) onClose();
  }, [onClose, removeState?.message, state?.message]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (viewing) {
        setViewing(false);
        return;
      }
      onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, viewing]);

  useEffect(() => {
    return () => {
      if (pickedUrl) URL.revokeObjectURL(pickedUrl);
    };
  }, [pickedUrl]);

  function chooseImage() {
    fileRef.current?.click();
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-primary/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contest-editor-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form action={action} className="relative my-4 flex w-full max-w-3xl flex-col gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="contest-editor-title" className="font-headline-sm text-headline-sm text-primary">
              {current ? "Edit contest" : "Add new Contest"}
            </h2>
            {current?.isHero ? (
              <p className="font-label-sm text-label-sm mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-tertiary-fixed px-2.5 py-1 text-on-tertiary-fixed">
                Homepage contest
              </p>
            ) : null}
          </div>
          <button
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary"
            type="button"
            onClick={onClose}
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>
        {current ? <input type="hidden" name="slug" value={current.slug} /> : null}
        <input type="hidden" name="image" value={current?.image ?? ""} />
        <input type="hidden" name="imageAlt" value={current?.imageAlt ?? ""} />
        <input type="hidden" name="fee" value={current?.fee || "Free Entry"} />
        <input
          ref={fileRef}
          name="file"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPickedUrl((previous) => {
              if (previous) URL.revokeObjectURL(previous);
              return file ? URL.createObjectURL(file) : null;
            });
          }}
        />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-primary">Name</span>
              <input name="name" required defaultValue={current?.title ?? ""} className={fieldClass} maxLength={120} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-primary">Description</span>
              <textarea name="description" required defaultValue={current?.description ?? ""} className={fieldClass} rows={3} maxLength={800} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary">Age range</span>
                <input name="ageRange" required defaultValue={current?.ageRange ?? ""} className={fieldClass} maxLength={40} placeholder="4-12 years" />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary">Registration status</span>
                <select name="registrationStatus" defaultValue={current?.status ?? "open"} className={fieldClass}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary">Reward</span>
                <input name="reward" required defaultValue={current?.reward ?? ""} className={fieldClass} maxLength={120} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary">Entry fee (₹)</span>
                <input name="entryFee" required type="number" min="0" step="1" defaultValue={current?.entryFee ?? "0"} className={fieldClass} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary">Start date</span>
                <input name="startDate" required type="date" defaultValue={current?.startDate ?? ""} className={fieldClass} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary">End date</span>
                <input name="endDate" required type="date" defaultValue={current?.endDate ?? ""} className={fieldClass} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary">Result date</span>
                <input name="resultDate" required type="date" defaultValue={current?.resultDate ?? ""} className={fieldClass} />
              </label>
            </div>
            <label className="flex items-start gap-2">
              <input name="isHero" type="checkbox" defaultChecked={current?.isHero ?? false} className="mt-1" />
              <span className="font-body-sm text-body-sm text-on-surface">
                Show this contest on the homepage. Only one contest can be featured. Saving replaces the current homepage contest.
              </span>
            </label>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-36">
            {preview ? (
              <img src={preview} alt="" className="h-36 w-full rounded-lg object-cover bg-surface" />
            ) : (
              <div className="font-body-sm text-body-sm flex h-36 w-full items-center justify-center rounded-lg bg-surface text-center text-on-surface-variant">
                No image
              </div>
            )}
            <button
              type="button"
              onClick={() => setViewing(true)}
              className="font-label-md text-label-md rounded-lg bg-surface-container px-3 py-2 font-semibold text-primary"
            >
              View image
            </button>
          </div>
        </div>
        {state?.error ? <p className="font-body-sm text-body-sm text-error">{state.error}</p> : null}
        {removeState?.error ? <p className="font-body-sm text-body-sm text-error">{removeState.error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={pending}
            className="font-label-md text-label-md rounded-lg bg-primary-container px-4 py-2 font-bold text-on-primary disabled:opacity-70"
          >
            {pending ? "Saving..." : current ? "Save contest" : "Add contest"}
          </button>
          {current ? (
            <button
              type="submit"
              formAction={remove}
              disabled={removing}
              className="font-label-md text-label-md rounded-lg bg-surface-container px-4 py-2 text-primary disabled:opacity-70"
            >
              {removing ? "Removing..." : "Delete"}
            </button>
          ) : null}
        </div>
        {viewing ? (
          <div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-primary/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Contest image"
          >
            <div className="relative flex w-full max-w-lg flex-col gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-2xl">
              <button
                aria-label="Close"
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-primary"
                type="button"
                onClick={() => setViewing(false)}
              >
                <Icon name="close" className="text-[20px]" />
              </button>
              {preview ? (
                <img src={preview} alt="" className="mt-8 max-h-[60vh] w-full rounded-lg object-contain bg-surface" />
              ) : (
                <p className="font-body-md text-body-md mt-8 text-on-surface-variant">No image yet.</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={chooseImage}
                  className="font-label-md text-label-md rounded-lg bg-surface-container px-4 py-2 font-bold text-primary"
                >
                  Change image
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="font-label-md text-label-md rounded-lg bg-primary-container px-4 py-2 font-bold text-on-primary disabled:opacity-70"
                >
                  {pending ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}

const columns = ["Name", "Age range", "Entry fee", "Start", "End", "Result", "Status", "Homepage", ""];

function contestHref(slug: string) {
  return `${adminPath}?section=contests&contest=${encodeURIComponent(slug)}`;
}

export function AdminContests({
  contests,
  ready,
  entries,
  entriesReady,
  announcedSlugs,
  contestSlug,
}: {
  contests: Contest[];
  ready: boolean;
  entries: ContestEntryRow[];
  entriesReady: boolean;
  announcedSlugs: string[];
  contestSlug?: string | null;
}) {
  const router = useRouter();
  const [editor, setEditor] = useState<Contest | "new" | null>(null);
  const closeEditor = useCallback(() => setEditor(null), []);
  const announced = new Set(announcedSlugs);
  const opened = contestSlug ? contests.find((contest) => contest.slug === contestSlug) ?? null : null;

  if (contestSlug) {
    const participants = entries.filter((entry) => entry.contestSlug === contestSlug);
    return (
      <div className="flex flex-col gap-4">
        <Link href={`${adminPath}?section=contests`} className="font-label-md text-label-md w-fit font-semibold text-secondary">
          Back to contests
        </Link>
        {!opened ? (
          <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
            <p className="font-headline-sm text-headline-sm text-primary">Contest not found</p>
            <p className="font-body-sm text-body-sm mt-1 text-on-surface-variant">
              This contest is not in the list. Go back and choose another one.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-container-lowest p-5 shadow-sm">
              <div>
                <p className="font-label-sm text-label-sm text-secondary">{opened.ageRange || opened.categoryLabel || "Contest"}</p>
                <p className="font-body-sm text-body-sm mt-1 text-on-surface-variant">
                  {formatDate(opened.startDate)} – {formatDate(opened.endDate)} · Result {formatDate(opened.resultDate)} · {opened.fee || "Free Entry"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditor(opened)}
                className="font-label-md text-label-md rounded-lg bg-surface-container px-3 py-2 font-semibold text-primary"
              >
                Edit contest
              </button>
            </div>
            <div>
              <h2 className="font-headline-md text-headline-md text-primary">Participants</h2>
              <p className="font-body-sm text-body-sm mt-1 text-on-surface-variant">
                {participants.length === 1 ? "1 entry" : `${participants.length} entries`}
              </p>
            </div>
            <ContestParticipants
              contestSlug={opened.slug}
              entries={participants}
              announced={announced.has(opened.slug)}
              ready={entriesReady}
            />
          </>
        )}
        {editor && editor !== "new" ? <ContestEditor key={editor.slug} contest={editor} onClose={closeEditor} /> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {ready ? null : (
        <p className="font-body-md text-body-md text-error">
          Run supabase/1-schema.sql once in the Supabase SQL editor, then open Contests again.
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {contests.length === 1 ? "1 contest" : `${contests.length} contests`}
        </p>
        <button
          type="button"
          onClick={() => setEditor("new")}
          className="font-label-lg text-label-lg rounded-lg bg-primary-container px-space-lg py-3 font-bold text-on-primary shadow-md"
        >
          Add new Contest
        </button>
      </div>
      {contests.length === 0 ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm">
          <p className="font-headline-sm text-headline-sm text-primary">No contests yet</p>
          <p className="font-body-sm text-body-sm mt-1 text-on-surface-variant">
            Use Add new Contest to create the first one.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-surface-container-lowest shadow-sm">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead className="bg-surface-container-low">
              <tr>
                {columns.map((heading) => (
                  <th key={heading || "actions"} className="font-label-sm text-label-sm px-4 py-3 text-on-surface-variant uppercase">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contests.map((contest) => (
                <tr
                  key={contest.slug}
                  className="cursor-pointer border-t border-surface-variant/70 hover:bg-surface-container-low"
                  onClick={() => router.push(contestHref(contest.slug))}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {contest.image ? (
                        <img src={contest.image} alt="" className="h-10 w-14 shrink-0 rounded-md object-cover bg-surface" />
                      ) : null}
                      <Link
                        href={contestHref(contest.slug)}
                        onClick={(event) => event.stopPropagation()}
                        className="font-body-md text-body-md font-semibold text-primary"
                      >
                        {contest.title}
                      </Link>
                    </div>
                  </td>
                  <td className="font-body-sm text-body-sm px-4 py-3 text-on-surface">{contest.ageRange || contest.categoryLabel || "—"}</td>
                  <td className="font-body-sm text-body-sm px-4 py-3 text-on-surface">{contest.fee || "Free Entry"}</td>
                  <td className="font-body-sm text-body-sm px-4 py-3 text-on-surface">{formatDate(contest.startDate)}</td>
                  <td className="font-body-sm text-body-sm px-4 py-3 text-on-surface">{formatDate(contest.endDate)}</td>
                  <td className="font-body-sm text-body-sm px-4 py-3 text-on-surface">{formatDate(contest.resultDate)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-label-sm text-label-sm inline-flex rounded-full px-2.5 py-1 ${
                        contest.status === "closed"
                          ? "bg-surface-container text-on-surface-variant"
                          : "bg-tertiary-fixed text-on-tertiary-fixed"
                      }`}
                    >
                      {contest.status === "closed" ? "Closed" : "Open"}
                    </span>
                  </td>
                  <td className="font-body-sm text-body-sm px-4 py-3 text-on-surface">{contest.isHero ? "Yes" : "—"}</td>
                  <td className="px-4 py-3 text-right" onClick={(event) => event.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setEditor(contest)}
                      className="font-label-md text-label-md rounded-lg bg-surface-container px-3 py-2 font-semibold text-primary"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editor ? (
        <ContestEditor key={editor === "new" ? "new" : editor.slug} contest={editor === "new" ? null : editor} onClose={closeEditor} />
      ) : null}
    </div>
  );
}
