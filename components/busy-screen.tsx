export function BusyScreen({ label }: { label: string }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/40 p-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 rounded-xl bg-surface-container-lowest px-5 py-4 shadow-md">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
        <span className="font-label-md text-label-md text-primary">{label}</span>
      </div>
    </div>
  );
}
