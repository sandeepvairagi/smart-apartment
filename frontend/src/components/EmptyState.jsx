/**
 * EmptyState — shown when a list has no data
 */
function EmptyState({ title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-6 py-14 text-center">
      <p className="font-display text-xl font-semibold text-[var(--color-ink)]">
        {title}
      </p>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-[var(--color-ink-muted)]">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
