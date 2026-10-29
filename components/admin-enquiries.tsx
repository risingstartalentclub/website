"use client";

import { useMemo, useState } from "react";
import { adminPeopleSql, type AdminEnquiry } from "@/lib/admin-path";

export function AdminEnquiries({
  enquiries,
  ready,
}: {
  enquiries: AdminEnquiry[];
  ready: boolean;
}) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return enquiries;
    return enquiries.filter((enquiry) =>
      [enquiry.name, enquiry.email, enquiry.message].join(" ").toLowerCase().includes(needle),
    );
  }, [enquiries, query]);

  if (!ready) {
    return (
      <p className="font-body-md text-body-md rounded-xl bg-error-container px-4 py-3 text-on-error-container">
        Run {adminPeopleSql} once in the Supabase SQL editor, then open this list again.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {enquiries.length === 200 ? "Showing the latest 200 enquiries." : `${enquiries.length} enquiries`}
        </p>
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Search enquiries</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, or message"
            className="font-body-sm text-body-sm w-full rounded-lg bg-surface-container-lowest px-3 py-2 text-on-surface shadow-sm outline-none"
          />
        </label>
      </div>
      {shown.length === 0 ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm">
          <p className="font-headline-sm text-headline-sm text-primary">
            {query ? "No matches" : "No enquiries yet"}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm md:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  {["Name", "Email", "Message", "Received"].map((heading) => (
                    <th key={heading} className="font-label-sm text-label-sm px-4 py-3 text-on-surface-variant uppercase">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((enquiry) => (
                  <tr key={enquiry.id} className="border-t border-surface-variant/70 align-top">
                    <td className="font-body-md text-body-md px-4 py-3 font-semibold text-primary">{enquiry.name}</td>
                    <td className="font-body-sm text-body-sm px-4 py-3 text-on-surface">
                      <a href={`mailto:${enquiry.email}`} className="text-secondary">
                        {enquiry.email}
                      </a>
                    </td>
                    <td className="font-body-sm text-body-sm max-w-md px-4 py-3 whitespace-pre-wrap break-words text-on-surface">
                      {enquiry.message}
                    </td>
                    <td className="font-body-sm text-body-sm px-4 py-3 whitespace-nowrap text-on-surface-variant">
                      {enquiry.received}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 md:hidden">
            {shown.map((enquiry) => (
              <article key={enquiry.id} className="rounded-xl bg-surface-container-lowest p-4 shadow-sm">
                <p className="font-headline-sm text-headline-sm text-primary">{enquiry.name}</p>
                <a href={`mailto:${enquiry.email}`} className="font-body-sm text-body-sm mt-1 block text-secondary">
                  {enquiry.email}
                </a>
                <p className="font-body-sm text-body-sm mt-2 whitespace-pre-wrap break-words text-on-surface">
                  {enquiry.message}
                </p>
                <p className="font-label-sm text-label-sm mt-2 text-on-surface-variant">Received {enquiry.received}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
