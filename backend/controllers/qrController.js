/**
 * QR Controller — unified QR module endpoints
 */
import asyncHandler from '../utils/asyncHandler.js';
import {
  verifyQrPass,
  scanQrPass,
  getQrPass,
  regenerateQrPass,
  getQrStats,
  formatQrVerification,
} from '../services/qrPassService.js';

const handleServiceError = (res, error) => {
  if (error.statusCode) res.status(error.statusCode);
  throw error;
};

/**
 * @desc    Verify QR pass (public read-only or guard)
 * @route   POST /api/qr/verify
 */
export const verifyQr = asyncHandler(async (req, res) => {
  try {
    const visitor = await verifyQrPass(req.body);

    res.status(200).json({
      success: true,
      message: 'QR code is valid',
      data: {
        valid: true,
        visitor: formatQrVerification(visitor),
      },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    Scan QR and check in (guard)
 * @route   POST /api/qr/scan
 */
export const scanQr = asyncHandler(async (req, res) => {
  try {
    const { visitor, action } = await scanQrPass(req.body);

    res.status(200).json({
      success: true,
      message:
        action === 'already-checked-in'
          ? 'Visitor is already checked in'
          : 'QR scanned — visitor checked in',
      data: {
        action,
        visitor: formatQrVerification(visitor),
      },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    QR usage stats (guard)
 * @route   GET /api/qr/stats
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await getQrStats();

  res.status(200).json({ success: true, data: { stats } });
});

/**
 * @desc    Get QR pass for visitor
 * @route   GET /api/qr/:visitorId
 */
export const getPass = asyncHandler(async (req, res) => {
  try {
    const result = await getQrPass(req.params.visitorId, {
      user: req.user,
      phone: req.query.phone,
    });

    res.status(200).json({
      success: true,
      data: {
        qrCode: result.qrCode,
        qrPayload: result.qrPayload,
        visitor: formatQrVerification(result.visitor),
      },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    Regenerate QR pass (guard or resident)
 * @route   POST /api/qr/:visitorId/regenerate
 */
export const regeneratePass = asyncHandler(async (req, res) => {
  try {
    const { visitor, qrPayload } = await regenerateQrPass(
      req.params.visitorId,
      req.user
    );

    res.status(200).json({
      success: true,
      message: 'QR pass regenerated',
      data: { visitor, qrPayload },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});
