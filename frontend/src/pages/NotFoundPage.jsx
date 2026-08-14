import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-surface)] px-6 text-center">
      <p className="font-display text-6xl font-bold text-[var(--color-accent)]">
        404
      </p>
      <h1 className="text-xl font-semibold text-[var(--color-ink)]">
        Page not found
      </h1>
      <Link
        to="/"
        className="rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-white"
      >
        Go home
      </Link>
    </div>
  );
}

export default NotFoundPage;
