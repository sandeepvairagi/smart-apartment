/**
 * QR Pass Service — unified QR verify, scan, regenerate, and stats.
 */
import Visitor from '../models/Visitor.js';
import {
  parseQrPayload,
  buildQrPayload,
  generateQrDataUrl,
  generateQrToken,
  isQrExpired,
  formatQrVerification,
} from './qrService.js';
import {
  checkInVisitor,
  populateVisitor,
} from './visitorService.js';

const markScanned = async (visitorId) => {
  await Visitor.findByIdAndUpdate(visitorId, { lastScannedAt: new Date() });
};

const expireIfStale = async (visitor) => {
  if (visitor.status === 'pending' && isQrExpired(visitor)) {
    visitor.status = 'expired';
    await visitor.save();
  }
  return visitor;
};

/**
 * Verify QR payload — returns visitor with validation metadata.
 */
export const verifyQrPass = async ({ qrData, visitorId, qrToken }) => {
  if (qrData) {
    const parsed = parseQrPayload(qrData);
    visitorId = parsed.visitorId;
    qrToken = parsed.qrToken;
  }

  if (!visitorId || !qrToken) {
    const error = new Error('visitorId and qrToken are required');
    error.statusCode = 400;
    throw error;
  }

  let visitor = await Visitor.findOne({ _id: visitorId, qrToken }).populate(
    populateVisitor
  );

  if (!visitor) {
    const error = new Error('Invalid or expired QR code');
    error.statusCode = 404;
    throw error;
  }

  visitor = await expireIfStale(visitor);

  if (['expired', 'cancelled'].includes(visitor.status)) {
    const error = new Error(`QR pass is ${visitor.status}`);
    error.statusCode = 400;
    throw error;
  }

  await markScanned(visitor._id);
  visitor.lastScannedAt = new Date();

  return visitor;
};

/**
 * Guard flow — verify QR and check in if still pending.
 */
export const scanQrPass = async (payload) => {
  const visitor = await verifyQrPass(payload);

  if (visitor.status === 'checked-in') {
    return { visitor, action: 'already-checked-in' };
  }

  if (visitor.status === 'checked-out') {
    const error = new Error('Visitor has already checked out');
    error.statusCode = 400;
    throw error;
  }

  if (visitor.status === 'expired') {
    const error = new Error('QR pass has expired');
    error.statusCode = 400;
    throw error;
  }

  const checkedIn = await checkInVisitor(visitor._id);
  return { visitor: checkedIn, action: 'checked-in' };
};

/**
 * Get QR pass image for a visitor with role-based access.
 */
export const getQrPass = async (visitorId, { user, phone } = {}) => {
  const visitor = await Visitor.findById(visitorId).populate(populateVisitor);

  if (!visitor) {
    const error = new Error('Visitor not found');
    error.statusCode = 404;
    throw error;
  }

  if (user?.role === 'resident') {
    if (String(visitor.resident._id) !== String(user._id)) {
      const error = new Error('Not authorized to view this QR pass');
      error.statusCode = 403;
      throw error;
    }
  } else if (!user) {
    if (!phone?.trim() || visitor.phone !== phone.trim()) {
      const error = new Error('Phone number does not match this visit');
      error.statusCode = 403;
      throw error;
    }
  }

  if (visitor.status !== 'pending') {
    const error = new Error('QR pass is only available for pending visits');
    error.statusCode = 400;
    throw error;
  }

  await expireIfStale(visitor);
  if (visitor.status === 'expired') {
    const error = new Error('QR pass has expired');
    error.statusCode = 400;
    throw error;
  }

  const qrPayload = buildQrPayload(visitor._id, visitor.qrToken);

  return {
    visitor,
    qrPayload,
    qrCode: visitor.qrCode,
    verification: formatQrVerification(visitor),
  };
};

/**
 * Regenerate QR for a pending visitor (guard or owning resident).
 */
export const regenerateQrPass = async (visitorId, user) => {
  const visitor = await Visitor.findById(visitorId);

  if (!visitor) {
    const error = new Error('Visitor not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'resident' && String(visitor.resident) !== String(user._id)) {
    const error = new Error('Not authorized to regenerate this QR pass');
    error.statusCode = 403;
    throw error;
  }

  if (visitor.status !== 'pending') {
    const error = new Error('QR can only be regenerated for pending visitors');
    error.statusCode = 400;
    throw error;
  }

  visitor.qrToken = generateQrToken();
  visitor.qrIssuedAt = new Date();
  const qrPayload = buildQrPayload(visitor._id, visitor.qrToken);
  visitor.qrCode = await generateQrDataUrl(qrPayload);
  await visitor.save();

  const populated = await Visitor.findById(visitor._id).populate(populateVisitor);

  return { visitor: populated, qrPayload };
};

/**
 * QR usage stats for guard dashboard.
 */
export const getQrStats = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [pendingPasses, scannedToday, checkedInToday, expiredToday] =
    await Promise.all([
      Visitor.countDocuments({ status: 'pending' }),
      Visitor.countDocuments({ lastScannedAt: { $gte: startOfDay } }),
      Visitor.countDocuments({
        status: 'checked-in',
        checkInAt: { $gte: startOfDay },
      }),
      Visitor.countDocuments({
        status: 'expired',
        updatedAt: { $gte: startOfDay },
      }),
    ]);

  return { pendingPasses, scannedToday, checkedInToday, expiredToday };
};

export { formatQrVerification };
