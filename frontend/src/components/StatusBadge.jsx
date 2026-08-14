const styles = {
  open: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  'in-progress':
    'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  resolved:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  closed: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  pending:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  'checked-in':
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  'checked-out':
    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  expired:
    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  cancelled:
    'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  received:
    'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  notified:
    'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
  delivered:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  returned:
    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  published:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  draft:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  normal:
    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  low: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  visitor:
    'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
  parcel:
    'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
  complaint:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  notice:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  system: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
};

function StatusBadge({ status }) {
  const key = (status || '').toLowerCase();
  const className =
    styles[key] ||
    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';

  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium capitalize ${className}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
