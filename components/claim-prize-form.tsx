"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { claimPrize, type ResultState } from "@/app/actions/results";
import { indianStates } from "@/lib/states";

const fieldClass =
  "font-body-md text-body-md w-full rounded-lg bg-surface px-3 py-2 text-on-surface shadow-sm outline-none";

export function ClaimPrizeForm({
  entryId,
  address,
  city,
  pincode,
  state,
}: {
  entryId: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
}) {
  const router = useRouter();
  const [result, action, pending] = useActionState<ResultState, FormData>(claimPrize, null);
  const claimed = Boolean(address && city && pincode && state);

  useEffect(() => {
    if (result?.message) router.refresh();
  }, [result?.message, router]);

  return (
    <form action={action} className="mt-space-sm grid gap-2 sm:grid-cols-2">
      <input type="hidden" name="entryId" value={entryId} />
      <p className="font-label-md text-label-md font-bold text-primary sm:col-span-2">Claim your prize</p>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="font-label-sm text-label-sm text-primary">Address</span>
        <input name="address" required defaultValue={address} maxLength={240} className={fieldClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm text-primary">City</span>
        <input name="city" required defaultValue={city} maxLength={80} className={fieldClass} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm text-primary">PIN code</span>
        <input name="pincode" required defaultValue={pincode} inputMode="numeric" maxLength={6} className={fieldClass} />
      </label>
      <label className="flex flex-col gap-1 sm:col-span-2">
        <span className="font-label-sm text-label-sm text-primary">State</span>
        <select name="state" required defaultValue={state} className={fieldClass}>
          <option value="">Choose a state</option>
          {indianStates.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      {result?.error ? <p className="font-body-sm text-body-sm text-error sm:col-span-2">{result.error}</p> : null}
      {result?.message ? <p className="font-body-sm text-body-sm text-primary sm:col-span-2">{result.message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="font-label-md text-label-md rounded-lg bg-primary-container px-4 py-2 font-bold text-on-primary disabled:opacity-70 sm:col-span-2 sm:w-fit"
      >
        {pending ? "Saving..." : claimed ? "Update prize details" : "Claim your prize"}
      </button>
    </form>
  );
}
