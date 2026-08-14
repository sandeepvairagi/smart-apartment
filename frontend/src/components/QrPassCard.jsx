import { downloadQrImage, copyQrPayload } from '../services/qrService';

function QrPassCard({
  visitor,
  qrCode,
  qrPayload,
  showActions = true,
  compact = false,
}) {
  if (!qrCode) return null;

  const name = visitor?.name || 'Visitor';
  const safeFilename = `qr-${name.replace(/\s+/g, '-').toLowerCase()}.png`;

  const onDownload = () => downloadQrImage(qrCode, safeFilename);

  const onCopy = async () => {
    if (qrPayload) await copyQrPayload(qrPayload);
  };

  return (
    <div
      className={`rounded-xl border border-[var(--color-accent)] bg-[var(--color-accent-soft)] ${
        compact ? 'p-4' : 'p-6'
      } text-center`}
    >
      <p className="text-sm font-medium">QR pass — {name}</p>
      {visitor?.resident?.name && (
        <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
          Visiting {visitor.resident.name}
          {visitor.resident.unitLabel ? ` · ${visitor.resident.unitLabel}` : ''}
        </p>
      )}
      <img
        src={qrCode}
        alt={`QR pass for ${name}`}
        className="mx-auto mt-3 rounded-lg border bg-white p-2"
      />
      {visitor?.expectedDate && (
        <p className="mt-2 text-xs text-[var(--color-ink-muted)]">
          Valid for {new Date(visitor.expectedDate).toLocaleDateString()}
        </p>
      )}
      {showActions && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onDownload}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs font-medium hover:border-[var(--color-accent)]"
          >
            Download PNG
          </button>
          {qrPayload && (
            <button
              type="button"
              onClick={onCopy}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-xs font-medium hover:border-[var(--color-accent)]"
            >
              Copy payload
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default QrPassCard;
