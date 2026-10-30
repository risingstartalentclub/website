"use client";

import { useActionState, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteContest, saveContest, type ContestState } from "@/app/actions/contests";
import { ContestParticipants, type ContestEntryRow } from "@/components/admin-winners";
import { Icon } from "@/components/icon";
import { adminPath } from "@/lib/admin-path";
import type { Contest } from "@/lib/content";

const fieldClass =
  "font-body-md text-body-md w-full rounded-lg border border-surface-variant bg-surface px-3 py-2.5 text-on-surface outline-none focus:border-secondary";

const imageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageBytes = 5 * 1024 * 1024;
const bannerSize = 512;

async function squareBanner(file: File) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = bannerSize;
  canvas.height = bannerSize;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("canvas");
  }
  context.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, bannerSize, bannerSize);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, file.type, 0.92));
  if (!blob) throw new Error("blob");
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  return new File([blob], `banner.${extension}`, { type: file.type });
}

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-label-sm text-label-sm font-bold text-primary">{label}</span>
      {hint ? <span className="font-body-sm text-body-sm -mt-1 text-on-surface-variant">{hint}</span> : null}
      {children}
    </label>
  );
}

function ContestEditor({ contest, onClose }: { contest: Contest | null; onClose: () => void }) {
  const [state, action, pending] = useActionState<ContestState, FormData>(saveContest, null);
  const [removeState, remove, removing] = useActionState<ContestState, FormData>(deleteContest, null);
  const [pickedUrl, setPickedUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [imageError, setImageError] = useState("");
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
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (pickedUrl) URL.revokeObjectURL(pickedUrl);
    };
  }, [pickedUrl]);

  async function takeImage(file: File | undefined) {
    if (!file) return;
    if (!imageTypes.includes(file.type) || file.size > maxImageBytes) {
      setImageError("Use a JPG, PNG, or WebP image up to 5 MB.");
      return;
    }
    try {
      const square = await squareBanner(file);
      setImageError("");
      if (fileRef.current) {
        const data = new DataTransfer();
        data.items.add(square);
        fileRef.current.files = data.files;
      }
      setPickedUrl((previous) => {
        if (previous) URL.revokeObjectURL(previous);
        return URL.createObjectURL(square);
      });
    } catch {
      setImageError("That image could not be prepared. Use a JPG, PNG, or WebP.");
    }
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
          onChange={(event) => takeImage(event.target.files?.[0])}
        />

        <section className="flex flex-col gap-2">
          <p className="font-label-sm text-label-sm font-bold tracking-wide text-primary uppercase">Banner</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            The contest card shows this as a 512 × 512 square. A wider photo is centered and cropped to fit.
          </p>
          <div className="mx-auto w-full max-w-[512px]">
            <div
              className={`relative aspect-square overflow-hidden rounded-xl border-2 border-dashed ${
                dragging ? "border-secondary bg-secondary-fixed/50" : "border-surface-variant bg-surface"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                void takeImage(event.dataTransfer.files?.[0]);
              }}
            >
              {preview ? (
                <img src={preview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <p className="font-body-md text-body-md text-primary">Drop a square banner here</p>
                  <p className="font-body-sm text-body-sm mt-1 text-on-surface-variant">512 × 512. JPG, PNG, or WebP, up to 5 MB.</p>
                </div>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {preview ? "This is the 512 × 512 square families will see." : "No image selected yet."}
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="font-label-md text-label-md rounded-lg bg-primary-container px-3 py-2 font-bold text-on-primary"
              >
                Choose image
              </button>
            </div>
          </div>
          {imageError ? <p className="font-body-sm text-body-sm text-error">{imageError}</p> : null}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Name">
              <input name="name" required defaultValue={current?.title ?? ""} className={fieldClass} maxLength={120} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea name="description" required defaultValue={current?.description ?? ""} className={fieldClass} rows={3} maxLength={800} />
            </Field>
          </div>
          <Field label="Age range" hint="Who can enter, such as 4-12 years.">
            <input name="ageRange" required defaultValue={current?.ageRange ?? ""} className={fieldClass} maxLength={40} placeholder="4-12 years" />
          </Field>
          <Field label="Registration status">
            <select name="registrationStatus" defaultValue={current?.status ?? "open"} className={fieldClass}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </Field>
          <Field label="Reward">
            <input name="reward" required defaultValue={current?.reward ?? ""} className={fieldClass} maxLength={120} />
          </Field>
          <Field label="Entry fee (₹)" hint="Use 0 for free entry.">
            <input name="entryFee" required type="number" min="0" step="1" defaultValue={current?.entryFee ?? "0"} className={fieldClass} />
          </Field>
          <Field label="Start date">
            <input name="startDate" required type="date" defaultValue={current?.startDate ?? ""} className={fieldClass} />
          </Field>
          <Field label="End date">
            <input name="endDate" required type="date" defaultValue={current?.endDate ?? ""} className={fieldClass} />
          </Field>
          <Field label="Result date">
            <input name="resultDate" required type="date" defaultValue={current?.resultDate ?? ""} className={fieldClass} />
          </Field>
        </section>

        <Field
          label="After participation"
          hint="Thank-you or instruction shown to the parent right after they enter this contest."
        >
          <textarea
            name="participationMessage"
            required
            defaultValue={current?.participationMessage ?? ""}
            className={fieldClass}
            rows={4}
            maxLength={800}
            placeholder="Thank you for entering. Send one clear photo to the club within 3 days."
          />
        </Field>

        <label className="flex items-start gap-2 rounded-lg bg-surface px-3 py-3">
          <input name="isHero" type="checkbox" defaultChecked={current?.isHero ?? false} className="mt-1" />
          <span className="font-body-sm text-body-sm text-on-surface">
            Show this contest on the homepage. Only one contest can be featured. Saving replaces the current homepage contest.
          </span>
        </label>

        {state?.error ? <p className="font-body-sm text-body-sm text-error">{state.error}</p> : null}
        {removeState?.error ? <p className="font-body-sm text-body-sm text-error">{removeState.error}</p> : null}
        <div className="flex flex-wrap gap-2 border-t border-surface-variant pt-4">
          <button
            type="submit"
            disabled={pending}
            className="font-label-md text-label-md rounded-lg bg-primary-container px-4 py-2.5 font-bold text-on-primary disabled:opacity-70"
          >
            {pending ? "Saving..." : current ? "Save contest" : "Add contest"}
          </button>
          {current ? (
            <button
              type="submit"
              formAction={remove}
              disabled={removing}
              className="font-label-md text-label-md rounded-lg bg-surface-container px-4 py-2.5 text-primary disabled:opacity-70"
            >
              {removing ? "Removing..." : "Delete"}
            </button>
          ) : null}
        </div>
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
                        <img src={contest.image} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover bg-surface" />
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
