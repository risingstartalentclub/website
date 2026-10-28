"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { signIn, signInAdmin, signUp, type AuthState } from "@/app/actions/auth";
import { emailError, mobileError, passwordError } from "@/lib/validation";

const fieldClass =
  "font-body-md text-body-md w-full rounded-lg bg-surface px-3 py-2 text-on-surface shadow-sm outline-none placeholder:text-[14px] placeholder:leading-5 focus:bg-surface-container-lowest";

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

export function AuthForm({
  mode,
  nextPath,
  onSwitch,
  titleId,
  allowSignup = true,
  adminGate = false,
}: {
  mode: "login" | "signup";
  nextPath?: string;
  onSwitch?: () => void;
  titleId?: string;
  allowSignup?: boolean;
  adminGate?: boolean;
}) {
  const action = mode === "signup" ? signUp : adminGate ? signInAdmin : signIn;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    null,
  );
  const isSignup = mode === "signup";
  const [showPassword, setShowPassword] = useState(false);
  const [mobile, setMobile] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    guardianName?: string;
    fullName?: string;
    mobile?: string;
    email?: string;
    password?: string;
  }>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const next: typeof fieldErrors = {};
    if (isSignup) {
      const guardianName = String(data.get("guardianName") ?? "").trim();
      if (guardianName.length < 2 || guardianName.length > 120) {
        next.guardianName = "Enter the parent or guardian name.";
      }
      const fullName = String(data.get("fullName") ?? "").trim();
      if (fullName.length < 2 || fullName.length > 120) {
        next.fullName = "Enter the participant's full name.";
      }
      const invalidMobile = mobileError(String(data.get("mobile") ?? ""));
      if (invalidMobile) next.mobile = invalidMobile;
    }
    const invalidEmail = emailError(String(data.get("email") ?? ""));
    if (invalidEmail) next.email = invalidEmail;
    const invalidPassword = passwordError(
      String(data.get("password") ?? ""),
      isSignup ? "signup" : "login",
    );
    if (invalidPassword) next.password = invalidPassword;
    setFieldErrors(next);
    if (next.guardianName || next.fullName || next.mobile || next.email || next.password) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-space-md" noValidate onSubmit={onSubmit}>
      <h2 id={titleId} className="font-headline-md text-headline-md pr-8 text-primary">
        {isSignup ? "Sign Up" : "Log In"}
      </h2>
      {!isSignup && nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      {isSignup ? (
        <>
          <label className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-primary">Parent or guardian name</span>
            <input
              name="guardianName"
              required
              type="text"
              autoComplete="name"
              className={fieldClass}
              placeholder="e.g. Priya Iyer"
              minLength={2}
              maxLength={120}
              aria-invalid={fieldErrors.guardianName ? true : undefined}
            />
            {fieldErrors.guardianName ? (
              <span className="font-body-sm text-body-sm text-error">{fieldErrors.guardianName}</span>
            ) : null}
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-primary">Participant name</span>
            <input
              name="fullName"
              required
              type="text"
              autoComplete="name"
              className={fieldClass}
              placeholder="e.g. Maya Iyer"
              minLength={2}
              maxLength={120}
              aria-invalid={fieldErrors.fullName ? true : undefined}
            />
            {fieldErrors.fullName ? (
              <span className="font-body-sm text-body-sm text-error">{fieldErrors.fullName}</span>
            ) : null}
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-label-sm text-label-sm text-primary">Mobile number</span>
            <input
              name="mobile"
              required
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              className={fieldClass}
              placeholder="98765 43210"
              maxLength={10}
              pattern="[6-9][0-9]{9}"
              value={mobile}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, "").slice(0, 10);
                setMobile(digits);
                setFieldErrors((current) => ({
                  ...current,
                  mobile:
                    digits && !/^[6-9]/.test(digits)
                      ? "Enter a 10-digit mobile number starting with 6, 7, 8, or 9."
                      : undefined,
                }));
              }}
              aria-invalid={fieldErrors.mobile ? true : undefined}
            />
            {fieldErrors.mobile ? (
              <span className="font-body-sm text-body-sm text-error">{fieldErrors.mobile}</span>
            ) : null}
          </label>
        </>
      ) : null}
      <label className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm text-primary">Email address</span>
        <input
          name="email"
          required
          type="email"
          autoComplete="email"
          className={fieldClass}
          placeholder="maya@example.com"
          maxLength={160}
          aria-invalid={fieldErrors.email ? true : undefined}
        />
        {fieldErrors.email ? (
          <span className="font-body-sm text-body-sm text-error">{fieldErrors.email}</span>
        ) : null}
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-label-sm text-label-sm text-primary">Password</span>
        <span className="relative block">
          <input
            name="password"
            required
            type={showPassword ? "text" : "password"}
            autoComplete={isSignup ? "new-password" : "current-password"}
            minLength={isSignup ? 8 : undefined}
            maxLength={72}
            className={`${fieldClass} pr-11`}
            placeholder={isSignup ? "At least 8 characters" : "Your password"}
            aria-invalid={fieldErrors.password ? true : undefined}
            aria-describedby={isSignup ? "password-rules" : undefined}
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
        {isSignup ? (
          <span id="password-rules" className="font-body-sm text-body-sm text-on-surface-variant">
            At least 8 characters, with one letter and one number.
          </span>
        ) : null}
        {fieldErrors.password ? (
          <span className="font-body-sm text-body-sm text-error">{fieldErrors.password}</span>
        ) : null}
      </label>
      {state?.error ? <p className="font-body-sm text-body-sm text-error">{state.error}</p> : null}
      {state?.message ? (
        <p className="font-body-sm text-body-sm rounded-lg bg-surface-container-low p-space-sm text-primary">
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="font-label-lg text-label-lg rounded-lg bg-primary-container py-3 font-bold text-on-primary shadow-md transition-colors hover:bg-secondary disabled:opacity-70"
      >
        {pending ? "Please wait..." : isSignup ? "Create Free Account" : "Log In"}
      </button>
      {allowSignup ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {isSignup ? (
            <>
              Already have an account?{" "}
              {onSwitch ? (
                <button type="button" onClick={onSwitch} className="font-semibold text-secondary">
                  Log In
                </button>
              ) : (
                <Link href="/login" className="font-semibold text-secondary">
                  Log In
                </Link>
              )}
            </>
          ) : (
            <>
              New to the club?{" "}
              {onSwitch ? (
                <button type="button" onClick={onSwitch} className="font-semibold text-secondary">
                  Sign Up
                </button>
              ) : (
                <Link href="/signup" className="font-semibold text-secondary">
                  Sign Up
                </Link>
              )}
            </>
          )}
        </p>
      ) : null}
    </form>
  );
}
