"use client";

import { useActionState, useState, type FormEvent } from "react";
import { sendMessage, type ContactState } from "@/app/actions/contact";
import { contactMessageError, contactNameError, emailError } from "@/lib/validation";

const fieldClass =
  "font-body-md text-body-md w-full rounded-lg bg-surface px-3 py-2 text-on-surface shadow-sm outline-none focus:bg-surface-container-lowest";

export function ContactSection() {
  const [state, formAction, pending] = useActionState<ContactState, FormData>(sendMessage, null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const next = {
      name: contactNameError(String(data.get("name") ?? "")) ?? undefined,
      email: emailError(String(data.get("email") ?? "")) ?? undefined,
      message: contactMessageError(String(data.get("message") ?? "")) ?? undefined,
    };
    setFieldErrors(next);
    if (next.name || next.email || next.message) event.preventDefault();
  }

  return (
    <section className="w-full scroll-mt-20 bg-surface-container-low py-space-xl" id="contact">
      <div className="mx-auto grid max-w-[1280px] gap-gutter px-margin-mobile md:px-margin lg:grid-cols-12">
        <div className="lg:col-span-5">
          <span className="font-label-sm text-label-sm mb-space-xs block font-bold tracking-widest text-secondary uppercase">
            Participant Support
          </span>
          <h2 className="font-headline-xl text-headline-xl-mobile md:text-headline-xl text-primary">
            Contact Us
          </h2>
          <p className="font-body-md text-body-md mt-2 max-w-md text-on-surface-variant">
            Our support team helps with submission guidelines and child safety
            standards.
          </p>
        </div>
        <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-md lg:col-span-7">
          {state?.ok ? (
            <p className="font-body-md text-body-md text-primary">{state.message}</p>
          ) : (
            <form action={formAction} className="flex flex-col gap-space-md" noValidate onSubmit={onSubmit}>
              <label className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary">Name</span>
                <input
                  name="name"
                  required
                  type="text"
                  autoComplete="name"
                  maxLength={120}
                  className={fieldClass}
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
                  autoComplete="email"
                  maxLength={160}
                  className={fieldClass}
                  aria-invalid={fieldErrors.email ? true : undefined}
                />
                {fieldErrors.email ? (
                  <span className="font-body-sm text-body-sm text-error">{fieldErrors.email}</span>
                ) : null}
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-label-sm text-label-sm text-primary">Message</span>
                <textarea
                  name="message"
                  required
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  className={fieldClass}
                  aria-invalid={fieldErrors.message ? true : undefined}
                />
                {fieldErrors.message ? (
                  <span className="font-body-sm text-body-sm text-error">{fieldErrors.message}</span>
                ) : null}
              </label>
              {state?.message ? <p className="font-body-sm text-body-sm text-error">{state.message}</p> : null}
              <button
                type="submit"
                disabled={pending}
                className="font-label-lg text-label-lg self-start rounded-lg bg-primary-container px-space-xl py-3 font-bold text-on-primary shadow-md transition-colors hover:bg-secondary disabled:opacity-70"
              >
                {pending ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
