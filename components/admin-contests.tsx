"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { deleteContest, saveContest, type ContestState } from "@/app/actions/contests";
import { Icon } from "@/components/icon";
import type { Contest } from "@/lib/content";

const fieldClass =
  "font-body-sm text-body-sm w-full rounded-lg bg-surface px-3 py-2 text-on-surface shadow-sm outline-none";

function ContestEditor({ contest }: { contest: Contest | null }) {
  const [state, action, pending] = useActionState<ContestState, FormData>(saveContest, null);
  const [removeState, remove, removing] = useActionState<ContestState, FormData>(deleteContest, null);
  const [viewing, setViewing] = useState(false);
  const [pickedUrl, setPickedUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const current = contest;
  const preview = pickedUrl || current?.image || "";

  useEffect(() => {
    if (!viewing) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setViewing(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [viewing]);

  useEffect(() => {
    return () => {
      if (pickedUrl) URL.revokeObjectURL(pickedUrl);
    };
  }, [pickedUrl]);

  useEffect(() => {
    if (state?.message) setViewing(false);
  }, [state?.message]);

  function chooseImage() {
    fileRef.current?.click();
  }

  return (
    <form
      action={action}
      className={`flex flex-col gap-3 rounded-xl bg-surface-container-lowest p-4 shadow-sm ${current?.isHero ? "ring-2 ring-tertiary-fixed-dim" : ""}`}
    >
      {current?.isHero ? (
        <p className="font-label-sm text-label-sm inline-flex w-fit items-center gap-1 rounded-full bg-tertiary-fixed px-2.5 py-1 text-on-tertiary-fixed">
          Homepage contest
        </p>
      ) : null}
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-primary">Title</span>
            <input name="title" required defaultValue={current?.title ?? ""} className={fieldClass} maxLength={120} />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-primary">Description</span>
            <textarea name="description" required defaultValue={current?.description ?? ""} className={fieldClass} rows={3} maxLength={400} />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-primary">Category</span>
              <input name="categoryLabel" required defaultValue={current?.categoryLabel ?? ""} className={fieldClass} maxLength={80} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-primary">Status</span>
              <select name="status" defaultValue={current?.status ?? "open"} className={fieldClass}>
                <option value="open">Registrations open</option>
                <option value="closed">Registrations closed</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-primary">End label</span>
              <input name="endsLabel" required defaultValue={current?.endsLabel ?? ""} className={fieldClass} maxLength={80} placeholder="Ends in 6 Days (Oct 28)" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-primary">Deadline</span>
              <input name="deadline" required defaultValue={current?.deadline ?? ""} className={fieldClass} maxLength={40} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-label-sm text-label-sm text-primary">Reward</span>
              <input name="reward" required defaultValue={current?.reward ?? ""} className={fieldClass} maxLength={120} />
            </label>
          </div>
          <label className="flex items-center gap-2">
            <input name="endsUrgent" type="checkbox" defaultChecked={current?.endsUrgent ?? false} />
            <span className="font-body-sm text-body-sm text-on-surface">Show the end label as urgent</span>
          </label>
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
      {state?.message ? <p className="font-body-sm text-body-sm text-primary">{state.message}</p> : null}
      {removeState?.error ? <p className="font-body-sm text-body-sm text-error">{removeState.error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="font-label-md text-label-md rounded-lg bg-primary-container px-4 py-2 font-bold text-on-primary disabled:opacity-70"
        >
          {pending ? "Saving..." : current ? "Save card" : "Add card"}
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
            {state?.error ? <p className="font-body-sm text-body-sm text-error">{state.error}</p> : null}
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
  );
}

export function AdminContests({
  contests,
  ready,
}: {
  contests: Contest[];
  ready: boolean;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {ready ? null : (
        <p className="font-body-md text-body-md text-error">
          Run supabase/4-contest-cards.sql and supabase/6-hero-and-people.sql once in the Supabase SQL editor, then open Contests again.
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="font-label-lg text-label-lg rounded-lg bg-primary-container px-space-lg py-3 font-bold text-on-primary shadow-md"
        >
          Add card
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {adding ? <ContestEditor contest={null} /> : null}
        {contests.map((contest) => (
          <ContestEditor key={contest.slug} contest={contest} />
        ))}
      </div>
    </div>
  );
}
