"use client";

import { useMemo, useState } from "react";
import { adminPeopleSql, type AdminPerson } from "@/lib/admin-path";

function phoneLabel(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    const local = digits.slice(2);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return phone;
}

export function AdminPeople({
  people,
  ready,
  emptyLabel,
}: {
  people: AdminPerson[];
  ready: boolean;
  emptyLabel: string;
}) {
  const [query, setQuery] = useState("");
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return people;
    return people.filter((person) =>
      [person.name, person.email, person.phone].join(" ").toLowerCase().includes(needle),
    );
  }, [people, query]);

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
          {people.length === 200 ? "Showing the latest 200 accounts." : `${people.length} accounts`}
        </p>
        <label className="relative block w-full sm:max-w-xs">
          <span className="sr-only">Search accounts</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, or mobile"
            className="font-body-sm text-body-sm w-full rounded-lg bg-surface-container-lowest px-3 py-2 text-on-surface shadow-sm outline-none"
          />
        </label>
      </div>
      {shown.length === 0 ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm">
          <p className="font-headline-sm text-headline-sm text-primary">{query ? "No matches" : emptyLabel}</p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm md:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  {["Name", "Email", "Mobile", "Joined"].map((heading) => (
                    <th key={heading} className="font-label-sm text-label-sm px-4 py-3 text-on-surface-variant uppercase">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((person) => (
                  <tr key={person.id} className="border-t border-surface-variant/70">
                    <td className="font-body-md text-body-md px-4 py-3 font-semibold text-primary">{person.name}</td>
                    <td className="font-body-sm text-body-sm px-4 py-3 text-on-surface">
                      {person.email ? (
                        <a href={`mailto:${person.email}`} className="text-secondary">
                          {person.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="font-body-sm text-body-sm px-4 py-3 text-on-surface">
                      {person.phone ? phoneLabel(person.phone) : "—"}
                    </td>
                    <td className="font-body-sm text-body-sm px-4 py-3 text-on-surface-variant">{person.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 md:hidden">
            {shown.map((person) => (
              <article key={person.id} className="rounded-xl bg-surface-container-lowest p-4 shadow-sm">
                <p className="font-headline-sm text-headline-sm text-primary">{person.name}</p>
                <p className="font-body-sm text-body-sm mt-1 text-secondary">{person.email || "No email"}</p>
                <p className="font-body-sm text-body-sm mt-1 text-on-surface">
                  {person.phone ? phoneLabel(person.phone) : "No mobile"}
                </p>
                <p className="font-label-sm text-label-sm mt-2 text-on-surface-variant">Joined {person.joined}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
