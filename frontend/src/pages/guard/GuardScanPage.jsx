import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { verifyQrPass, scanQrPass } from '../../services/qrService';
import { checkOutVisitor } from '../../services/guardService';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';

function GuardScanPage() {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [autoCheckIn, setAutoCheckIn] = useState(true);
  const [manualData, setManualData] = useState('');
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const stopScanner = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
      scannerRef.current.clear();
    }
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const processQr = async (qrData) => {
    setLoading(true);
    setError('');
    setMessage('');
    setVisitor(null);
    try {
      if (autoCheckIn) {
        const { data } = await scanQrPass({ qrData });
        setVisitor(data.data.visitor);
        setMessage(data.message);
      } else {
        const { data } = await verifyQrPass({ qrData });
        setVisitor(data.data.visitor);
        setMessage('QR verified — you can check in or check out below.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const startScanner = async () => {
    setError('');
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          await stopScanner();
          await processQr(decodedText);
        },
        () => {}
      );
      setScanning(true);
    } catch (err) {
      setError(
        err.message ||
          'Camera not available. Use manual paste or allow camera permission.'
      );
    }
  };

  const onManualVerify = (e) => {
    e.preventDefault();
    if (!manualData.trim()) return;
    processQr(manualData.trim());
  };

  const onCheckOut = async () => {
    if (!visitor) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await checkOutVisitor(visitor.id || visitor._id);
      setVisitor(data.data.visitor);
      setMessage('Visitor checked out successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Scan QR code</h1>
      <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
        Verify visitor pass and manage gate entry.
      </p>

      <label className="mt-6 flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={autoCheckIn}
          onChange={(e) => setAutoCheckIn(e.target.checked)}
        />
        Auto check-in on successful scan
      </label>

      <div className="mt-4 space-y-6">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
          <div id="qr-reader" className="overflow-hidden rounded-lg" />
          {!scanning ? (
            <button
              type="button"
              onClick={startScanner}
              className="mt-4 w-full rounded-md bg-[var(--color-accent)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
            >
              Start camera scan
            </button>
          ) : (
            <button
              type="button"
              onClick={stopScanner}
              className="mt-4 w-full rounded-md border border-[var(--color-border)] py-2.5 text-sm font-semibold"
            >
              Stop camera
            </button>
          )}
        </div>

        <form
          onSubmit={onManualVerify}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6"
        >
          <p className="text-sm font-medium">Or paste QR payload manually</p>
          <textarea
            value={manualData}
            onChange={(e) => setManualData(e.target.value)}
            rows={3}
            placeholder='{"type":"visitor-pass","visitorId":"...","qrToken":"..."}'
            className="mt-2 w-full rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 font-mono text-xs outline-none focus:border-[var(--color-accent)]"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-3 rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:border-[var(--color-accent)]"
          >
            {autoCheckIn ? 'Scan & check in' : 'Verify manually'}
          </button>
        </form>

        {loading && <Spinner label="Processing..." />}
        {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
        {message && <p className="text-sm text-[var(--color-success)]">{message}</p>}

        {visitor && (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-xl font-semibold">{visitor.name}</h2>
                <p className="text-sm text-[var(--color-ink-muted)]">{visitor.phone}</p>
                <p className="mt-2 text-sm">
                  Visiting: <strong>{visitor.resident?.name}</strong>
                  {visitor.resident?.unitLabel
                    ? ` (${visitor.resident.unitLabel})`
                    : ''}
                </p>
                <p className="text-sm text-[var(--color-ink-muted)]">
                  Purpose: {visitor.purpose}
                </p>
                {visitor.lastScannedAt && (
                  <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                    Last scanned: {new Date(visitor.lastScannedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <StatusBadge status={visitor.status} />
            </div>

            {visitor.canCheckOut && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={onCheckOut}
                  disabled={loading}
                  className="rounded-md bg-[var(--color-ink)] px-4 py-2 text-sm font-semibold text-white"
                >
                  Check out
                </button>
              </div>
            )}

            {visitor.expired && (
              <p className="mt-4 text-sm text-[var(--color-danger)]">
                This pass has expired for the scheduled visit date.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

export default GuardScanPage;
