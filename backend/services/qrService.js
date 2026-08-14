/**
 * QR Code service — low-level QR generation and payload helpers.
 */
import QRCode from 'qrcode';
import crypto from 'crypto';

export const QR_PASS_TYPE = 'visitor-pass';

/** Create a random token stored in DB and embedded in the QR payload */
export const generateQrToken = () => crypto.randomBytes(16).toString('hex');

/**
 * Build the JSON string encoded inside the QR code.
 * Guard scan page and public verify parse this payload.
 */
export const buildQrPayload = (visitorId, qrToken) =>
  JSON.stringify({
    type: QR_PASS_TYPE,
    visitorId: String(visitorId),
    qrToken,
    issuedAt: new Date().toISOString(),
  });

/**
 * Parse raw QR scan text into { visitorId, qrToken }.
 */
export const parseQrPayload = (qrData) => {
  try {
    const parsed = JSON.parse(qrData);
    return {
      visitorId: parsed.visitorId,
      qrToken: parsed.qrToken,
      type: parsed.type || QR_PASS_TYPE,
    };
  } catch {
    const error = new Error('Invalid QR data format');
    error.statusCode = 400;
    throw error;
  }
};

/**
 * True when the visit date has passed (end of expected day).
 */
export const isQrExpired = (visitor) => {
  if (!visitor?.expectedDate) return false;
  const expiry = new Date(visitor.expectedDate);
  expiry.setHours(23, 59, 59, 999);
  return new Date() > expiry;
};

/**
 * Generate a base64 PNG data URL for display in the UI.
 */
export const generateQrDataUrl = async (payload) => {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 280,
  });
};

/**
 * Safe verification summary returned to clients.
 */
export const formatQrVerification = (visitor) => ({
  id: visitor._id,
  name: visitor.name,
  phone: visitor.phone,
  status: visitor.status,
  purpose: visitor.purpose,
  expectedDate: visitor.expectedDate,
  checkInAt: visitor.checkInAt,
  checkOutAt: visitor.checkOutAt,
  qrIssuedAt: visitor.qrIssuedAt,
  lastScannedAt: visitor.lastScannedAt,
  expired: isQrExpired(visitor),
  canCheckIn: visitor.status === 'pending' && !isQrExpired(visitor),
  canCheckOut: visitor.status === 'checked-in',
  resident: visitor.resident
    ? {
        name: visitor.resident.name,
        unitLabel: visitor.resident.unitLabel,
      }
    : undefined,
});
