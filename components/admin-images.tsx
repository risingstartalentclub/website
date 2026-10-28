"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateSiteImage, type MediaState } from "@/app/actions/media";
import { siteImageSlots, type SiteImageKey, type SiteImages } from "@/lib/site-images";

function ImageCard({
  imageKey,
  label,
  current,
}: {
  imageKey: SiteImageKey;
  label: string;
  current: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const refreshedUrl = useRef<string | null>(null);
  const [state, action, pending] = useActionState<MediaState, FormData>(updateSiteImage, null);
  const [pickedName, setPickedName] = useState("");
  const [pickedUrl, setPickedUrl] = useState<string | null>(null);
  const notice = state?.key === imageKey ? state : null;
  const logo = imageKey === "logo";
  const shown = pickedUrl ?? notice?.imageUrl ?? current;

  useEffect(() => {
    if (!notice?.imageUrl || refreshedUrl.current === notice.imageUrl) return;
    refreshedUrl.current = notice.imageUrl;
    setPickedUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
    setPickedName("");
    if (fileRef.current) fileRef.current.value = "";
    router.refresh();
  }, [notice?.imageUrl, router]);

  return (
    <form
      action={action}
      className="flex flex-col gap-space-sm rounded-xl border border-surface-variant bg-surface-container-lowest p-space-md shadow-sm"
    >
      <h2 className="font-headline-sm text-headline-sm text-primary">{label}</h2>
      <img
        src={shown}
        alt=""
        className={`h-44 w-full rounded-lg bg-surface-container ${logo ? "object-contain p-space-sm" : "object-cover"}`}
      />
      <input type="hidden" name="key" value={imageKey} />
      <input
        ref={fileRef}
        name="file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) {
            setPickedName("");
            setPickedUrl(null);
            return;
          }
          setPickedName(file.name);
          setPickedUrl((previous) => {
            if (previous) URL.revokeObjectURL(previous);
            return URL.createObjectURL(file);
          });
        }}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="font-label-lg text-label-lg rounded-lg border border-primary-container px-4 py-3 font-bold text-primary"
          onClick={() => fileRef.current?.click()}
        >
          Upload image
        </button>
        <button
          type="submit"
          disabled={pending || !pickedName}
          className="font-label-lg text-label-lg flex-1 rounded-lg bg-primary-container py-3 font-bold text-on-primary shadow-md transition-colors hover:bg-secondary disabled:opacity-70"
        >
          {pending ? "Saving..." : "Save image"}
        </button>
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        {pickedName || "JPG, PNG, or WebP under 5 MB."}
      </p>
      {notice?.error ? <p className="font-body-sm text-body-sm text-error">{notice.error}</p> : null}
      {notice?.message ? (
        <p className="font-body-sm text-body-sm rounded-lg bg-surface-container-low p-space-sm text-primary">
          {notice.message}
        </p>
      ) : null}
    </form>
  );
}

export function AdminImages({ images }: { images: SiteImages }) {
  return (
    <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
      {siteImageSlots.map((slot) => (
        <ImageCard
          key={slot.key}
          imageKey={slot.key}
          label={slot.label}
          current={images[slot.key]}
        />
      ))}
    </div>
  );
}
