"use client";

import { useActionState, useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createAdmin, type AdminCreateState } from "@/app/actions/admins";
import { Icon } from "@/components/icon";
import { adminPeopleSql, type AdminPerson } from "@/lib/admin-path";
import { emailError, passwordError } from "@/lib/validation";

const fieldClass =
  "font-body-sm text-body-sm w-full rounded-lg bg-surface px-3 py-2 text-on-surface shadow-sm outline-none";

function phoneLabel(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    const local = digits.slice(2);
    return `+91 ${local.slice(0, 5)} ${local.slice(5)}`;
  }
  return phone;
}

function PasswordEye({ hidden }: { hidden: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {hidden ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.1A10.8 10.8 0 0 1 12 5c5 0 9.3 3.1 11 7a11.8 11.8 0 0 1-4.2 5.1" />
          <path d="M6.7 6.7A11.6 11.6 0 0 0 2 12c1.7 3.9 6 7 10 7 1.6 0 3.1-.4 4.5-1" />
        </>
      )}
    </svg>
  );
}

function AddAdminDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [state, action, pending] = useActionState<AdminCreateState, FormData>(createAdmin, null);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    if (state?.message) onCreated();
  }, [onCreated, state?.message]);

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

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");
    const next: typeof fieldErrors = {};
    if (name.length < 2 || name.length > 120) next.name = "Enter the admin name.";
    const invalidEmail = emailError(String(data.get("email") ?? ""));
    if (invalidEmail) next.email = invalidEmail;
    const invalidPassword = passwordError(password, "signup");
    if (invalidPassword) next.password = invalidPassword;
    if (password !== confirmPassword) next.confirmPassword = "Those passwords do not match.";
    setFieldErrors(next);
    if (next.name || next.email || next.password || next.confirmPassword) event.preventDefault();
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-primary/60 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-admin-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        action={action}
        noValidate
        onSubmit={onSubmit}
        className="relative my-4 flex w-full max-w-lg flex-col gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="add-admin-title" className="font-headline-sm text-headline-sm text-primary">
              Add admin
            </h2>
            <p className="font-body-sm text-body-sm mt-1 text-on-surface-variant">
              They can sign in at the admin login with this email and password.
            </p>
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
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-primary">Name</span>
          <input
            name="name"
            required
            autoComplete="name"
            className={fieldClass}
            maxLength={120}
            placeholder="e.g. Ananya Shah"
            aria-invalid={fieldErrors.name ? true : undefined}
          />
          {fieldErrors.name ? <span className="font-body-sm text-body-sm text-error">{fieldErrors.name}</span> : null}
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-primary">Email address</span>
          <input
            name="email"
            required
            type="email"
            autoComplete="off"
            className={fieldClass}
            maxLength={160}
            placeholder="maya@example.com"
            aria-invalid={fieldErrors.email ? true : undefined}
          />
          {fieldErrors.email ? <span className="font-body-sm text-body-sm text-error">{fieldErrors.email}</span> : null}
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-primary">Password</span>
          <span className="relative block">
            <input
              name="password"
              required
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              className={`${fieldClass} pr-11`}
              placeholder="At least 8 characters"
              aria-invalid={fieldErrors.password ? true : undefined}
              aria-describedby="admin-password-rules"
            />
            <button
              type="button"
              className="absolute top-1/2 right-1.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-on-surface-variant"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              <PasswordEye hidden={!showPassword} />
            </button>
          </span>
          <span id="admin-password-rules" className="font-body-sm text-body-sm text-on-surface-variant">
            At least 8 characters, with one letter and one number.
          </span>
          {fieldErrors.password ? (
            <span className="font-body-sm text-body-sm text-error">{fieldErrors.password}</span>
          ) : null}
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-label-sm text-label-sm text-primary">Confirm password</span>
          <input
            name="confirmPassword"
            required
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
            className={fieldClass}
            aria-invalid={fieldErrors.confirmPassword ? true : undefined}
          />
          {fieldErrors.confirmPassword ? (
            <span className="font-body-sm text-body-sm text-error">{fieldErrors.confirmPassword}</span>
          ) : null}
        </label>
        {state?.error ? <p className="font-body-sm text-body-sm text-error">{state.error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="font-label-lg text-label-lg rounded-lg bg-primary-container py-3 font-bold text-on-primary shadow-md disabled:opacity-70"
        >
          {pending ? "Adding..." : "Add admin"}
        </button>
      </form>
    </div>
  );
}

export function AdminPeople({
  people,
  ready,
  emptyLabel,
  kind = "parent",
}: {
  people: AdminPerson[];
  ready: boolean;
  emptyLabel: string;
  kind?: "admin" | "parent";
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [notice, setNotice] = useState("");
  const isAdminList = kind === "admin";
  const shown = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return people;
    return people.filter((person) =>
      [person.name, person.email, person.phone, person.city, person.state].join(" ").toLowerCase().includes(needle),
    );
  }, [people, query]);
  const columns = isAdminList ? ["Name", "Email", "Joined"] : ["Name", "Email", "Mobile", "City", "Joined"];
  const countLabel =
    people.length === 200
      ? `Showing the latest 200 ${isAdminList ? "admins" : "accounts"}.`
      : isAdminList
        ? people.length === 1
          ? "1 admin"
          : `${people.length} admins`
        : `${people.length} accounts`;

  if (!ready) {
    return (
      <p className="font-body-md text-body-md rounded-xl bg-error-container px-4 py-3 text-on-error-container">
        Run {adminPeopleSql} once in the Supabase SQL editor, then open this list again.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {notice ? (
        <p className="font-body-sm text-body-sm rounded-lg bg-surface-container-low px-4 py-3 text-primary">{notice}</p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-body-sm text-body-sm text-on-surface-variant">{countLabel}</p>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Search accounts</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isAdminList ? "Search name or email" : "Search name, email, or mobile"}
              className="font-body-sm text-body-sm w-full rounded-lg bg-surface-container-lowest px-3 py-2 text-on-surface shadow-sm outline-none"
            />
          </label>
          {isAdminList ? (
            <button
              type="button"
              onClick={() => {
                setNotice("");
                setAdding(true);
              }}
              className="font-label-lg text-label-lg shrink-0 rounded-lg bg-primary-container px-space-lg py-3 font-bold text-on-primary shadow-md"
            >
              Add admin
            </button>
          ) : null}
        </div>
      </div>
      {shown.length === 0 ? (
        <div className="rounded-xl bg-surface-container-lowest p-6 text-center shadow-sm">
          <p className="font-headline-sm text-headline-sm text-primary">{query ? "No matches" : emptyLabel}</p>
          {isAdminList && !query ? (
            <p className="font-body-sm text-body-sm mt-1 text-on-surface-variant">Use Add admin to create a staff login.</p>
          ) : null}
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm md:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  {columns.map((heading) => (
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
                    {isAdminList ? null : (
                      <>
                        <td className="font-body-sm text-body-sm px-4 py-3 text-on-surface">
                          {person.phone ? phoneLabel(person.phone) : "—"}
                        </td>
                        <td className="font-body-sm text-body-sm px-4 py-3 text-on-surface">
                          {person.city ? `${person.city}${person.state ? `, ${person.state}` : ""}` : "—"}
                        </td>
                      </>
                    )}
                    <td className="font-body-sm text-body-sm px-4 py-3 whitespace-nowrap text-on-surface-variant">{person.joined}</td>
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
                {isAdminList ? null : (
                  <p className="font-body-sm text-body-sm mt-1 text-on-surface">
                    {person.phone ? phoneLabel(person.phone) : "No mobile"}
                  </p>
                )}
                <p className="font-label-sm text-label-sm mt-2 text-on-surface-variant">Joined {person.joined}</p>
              </article>
            ))}
          </div>
        </>
      )}
      {adding ? (
        <AddAdminDialog
          onClose={() => setAdding(false)}
          onCreated={() => {
            setAdding(false);
            setNotice("Admin added. They can log in with this email and password.");
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}
