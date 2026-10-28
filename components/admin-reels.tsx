"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteWinnerReel, saveWinnerReel, type ReelState } from "@/app/actions/reels";
import { ReelFrame } from "@/components/reel-frame";
import { playableReel } from "@/lib/reels";

const fieldClass =
  "font-body-md text-body-md w-full rounded-lg border border-surface-variant bg-surface-container-lowest px-3 py-3 text-on-surface outline-none focus:border-primary";

function ReelCardForm({
  slot,
  title,
  videoUrl,
  onRemoveDraft,
}: {
  slot: number;
  title: string;
  videoUrl: string;
  onRemoveDraft?: (slot: number) => void;
}) {
  const router = useRouter();
  const refreshed = useRef<string | null>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveState, saveAction, savePending] = useActionState<ReelState, FormData>(saveWinnerReel, null);
  const [deleteState, deleteAction, deletePending] = useActionState<ReelState, FormData>(deleteWinnerReel, null);
  const filled = title.length > 0 && videoUrl.length > 0;
  const notice = deleteState?.error || deleteState?.message ? deleteState : saveState;

  useEffect(() => {
    const message = saveState?.message ?? deleteState?.message;
    if (!message || refreshed.current === message) return;
    refreshed.current = message;
    router.refresh();
  }, [saveState?.message, deleteState?.message, router]);

  const preview = playableReel(videoUrl);

  return (
    <article className="overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest shadow-sm">
      {preview ? (
        <ReelFrame compact kind={preview.kind} src={preview.src} title={title || `Card ${slot}`} />
      ) : null}
      <form key={`${slot}-${title}-${videoUrl}`} action={saveAction} className="flex flex-col gap-space-sm p-space-md">
        <h2 className="font-headline-sm text-headline-sm text-primary">Card {slot}</h2>
        <input type="hidden" name="slot" value={slot} />
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm font-bold text-primary">Title</span>
          <input
            name="title"
            type="text"
            required
            maxLength={80}
            defaultValue={title}
            className={fieldClass}
            placeholder="Festive spotlight"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm font-bold text-primary">Reel URL</span>
          <input
            name="videoUrl"
            type="url"
            required
            defaultValue={videoUrl}
            className={fieldClass}
            placeholder="https://www.instagram.com/reel/..."
          />
        </label>
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={savePending}
            className="font-label-lg text-label-lg flex-1 rounded-lg bg-primary-container px-4 py-3 font-bold text-on-primary shadow-md transition-colors hover:bg-secondary disabled:opacity-70"
          >
            {savePending ? "Saving..." : filled ? "Replace reel" : "Save card"}
          </button>
          {filled ? (
            <button
              type="button"
              className="font-label-lg text-label-lg rounded-lg border border-primary-container bg-surface-container-lowest px-4 py-3 font-bold text-primary"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </button>
          ) : onRemoveDraft ? (
            <button
              type="button"
              className="font-label-lg text-label-lg rounded-lg border border-primary-container bg-surface-container-lowest px-4 py-3 font-bold text-primary"
              onClick={() => onRemoveDraft(slot)}
            >
              Delete
            </button>
          ) : null}
        </div>
        {confirmDelete && filled ? (
          <div className="flex flex-col gap-2 rounded-lg bg-surface-container-lowest p-3">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Delete this reel from Meet Our Rising Stars?
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={deletePending}
                className="font-label-lg text-label-lg flex-1 rounded-lg bg-primary-container px-4 py-3 font-bold text-on-primary disabled:opacity-70"
                onClick={() => deleteFormRef.current?.requestSubmit()}
              >
                {deletePending ? "Deleting..." : "Delete reel"}
              </button>
              <button
                type="button"
                className="font-label-lg text-label-lg flex-1 rounded-lg border border-primary-container px-4 py-3 font-bold text-primary"
                onClick={() => setConfirmDelete(false)}
              >
                Keep
              </button>
            </div>
          </div>
        ) : null}
        {notice?.error ? <p className="font-body-sm text-body-sm text-error">{notice.error}</p> : null}
        {notice?.message ? (
          <p className="font-body-sm text-body-sm rounded-lg bg-surface-container-lowest p-space-sm text-primary">
            {notice.message}
          </p>
        ) : null}
      </form>
      {filled ? (
        <form ref={deleteFormRef} action={deleteAction} className="hidden">
          <input type="hidden" name="slot" value={slot} />
        </form>
      ) : null}
    </article>
  );
}

export function AdminReels({
  reels,
  draftSlots,
  onRemoveDraft,
}: {
  reels: { slot: number; title: string; videoUrl: string }[];
  draftSlots: number[];
  onRemoveDraft: (slot: number) => void;
}) {
  const saved = reels.filter((reel) => reel.slot >= 1).sort((a, b) => a.slot - b.slot);
  const savedSlots = new Set(saved.map((reel) => reel.slot));
  const drafts = draftSlots.filter((slot) => slot >= 1 && !savedSlots.has(slot));

  if (saved.length === 0 && drafts.length === 0) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant">
        Use Add card at the top right. Each click opens another reel card.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {saved.map((reel) => (
        <ReelCardForm key={reel.slot} slot={reel.slot} title={reel.title} videoUrl={reel.videoUrl} />
      ))}
      {drafts.map((slot) => (
        <ReelCardForm key={`draft-${slot}`} slot={slot} title="" videoUrl="" onRemoveDraft={onRemoveDraft} />
      ))}
    </div>
  );
}
