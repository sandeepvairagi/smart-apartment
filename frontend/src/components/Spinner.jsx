/**
 * Spinner — reusable loading indicator
 */
function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12" role="status">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-accent)]"
        aria-hidden="true"
      />
      <p className="text-sm text-[var(--color-ink-muted)]">{label}</p>
    </div>
  );
}

export default Spinner;
