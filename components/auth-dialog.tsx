"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AuthForm } from "@/components/auth-form";
import { Icon } from "@/components/icon";

export function AuthDialog({
  mode,
  onClose,
  onMode,
}: {
  mode: "login" | "signup";
  onClose: () => void;
  onMode: (mode: "login" | "signup") => void;
}) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90] overflow-y-auto bg-primary/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-dialog-title"
    >
      <div className="flex min-h-full items-center justify-center">
      <div className="relative my-auto w-full max-w-md rounded-xl bg-surface-container-lowest p-space-lg shadow-2xl">
        <button
          type="button"
          aria-label="Close"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-primary"
          onClick={onClose}
        >
          <Icon name="close" className="text-[20px]" />
        </button>
        <AuthForm
          key={mode}
          mode={mode}
          titleId="auth-dialog-title"
          onSwitch={() => onMode(mode === "login" ? "signup" : "login")}
        />
      </div>
      </div>
    </div>,
    document.body,
  );
}
