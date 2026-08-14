/**
 * Visitor Controller — public visitor portal + resident pre-registration
 */
import asyncHandler from '../utils/asyncHandler.js';
import {
  createVisitorWithQr,
  verifyVisitorQr,
  getVisitorStatus,
  getVisitorHistoryByPhone,
  searchResidentsPublic,
} from '../services/visitorService.js';

const handleServiceError = (res, error) => {
  if (error.statusCode) {
    res.status(error.statusCode);
  }
  throw error;
};

/**
 * @desc    Public visitor self-registration
 * @route   POST /api/visitor/register
 * @access  Public
 */
export const registerVisitor = asyncHandler(async (req, res) => {
  const { name, phone, purpose, residentId, expectedDate } = req.body;

  if (!name?.trim() || !phone?.trim() || !residentId) {
    res.status(400);
    throw new Error('Name, phone, and resident are required');
  }

  try {
    const { visitor, qrPayload } = await createVisitorWithQr({
      name,
      phone,
      purpose,
      residentId,
      expectedDate,
      createdBy: null,
    });

    res.status(201).json({
      success: true,
      message: 'Visit registered. Save your QR pass for gate entry.',
      data: {
        visitor: {
          id: visitor._id,
          name: visitor.name,
          phone: visitor.phone,
          purpose: visitor.purpose,
          status: visitor.status,
          expectedDate: visitor.expectedDate,
          qrCode: visitor.qrCode,
          resident: {
            name: visitor.resident?.name,
            unitLabel: visitor.resident?.unitLabel,
          },
        },
        qrPayload,
      },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    Resident pre-registers an expected guest
 * @route   POST /api/visitor/resident/pre-register
 * @access  Private (resident)
 */
export const residentPreRegister = asyncHandler(async (req, res) => {
  const { name, phone, purpose, expectedDate } = req.body;

  if (!name?.trim() || !phone?.trim()) {
    res.status(400);
    throw new Error('Guest name and phone are required');
  }

  try {
    const { visitor, qrPayload } = await createVisitorWithQr({
      name,
      phone,
      purpose,
      residentId: req.user._id,
      expectedDate,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Expected guest registered',
      data: { visitor, qrPayload },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    Search residents for registration (public, limited fields)
 * @route   GET /api/visitor/residents
 * @access  Public
 */
export const getResidentsForRegistration = asyncHandler(async (req, res) => {
  const residents = await searchResidentsPublic(req.query.search || '');

  res.status(200).json({
    success: true,
    data: {
      residents: residents.map((r) => ({
        id: r._id,
        name: r.name,
        unitLabel: r.unitLabel || '',
      })),
    },
  });
});

/**
 * @desc    Verify QR code (public read-only)
 * @route   POST /api/visitor/verify
 * @access  Public
 */
export const verifyQrPublic = asyncHandler(async (req, res) => {
  try {
    const visitor = await verifyVisitorQr(req.body);

    res.status(200).json({
      success: true,
      message: 'QR code is valid',
      data: {
        valid: true,
        visitor: {
          id: visitor._id,
          name: visitor.name,
          status: visitor.status,
          purpose: visitor.purpose,
          expectedDate: visitor.expectedDate,
          checkInAt: visitor.checkInAt,
          checkOutAt: visitor.checkOutAt,
          resident: {
            name: visitor.resident?.name,
            unitLabel: visitor.resident?.unitLabel,
          },
        },
      },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    Get visitor status (requires phone match)
 * @route   GET /api/visitor/status/:id?phone=
 * @access  Public
 */
export const getStatus = asyncHandler(async (req, res) => {
  const { phone } = req.query;

  if (!phone?.trim()) {
    res.status(400);
    throw new Error('Phone query parameter is required');
  }

  try {
    const visitor = await getVisitorStatus(req.params.id, phone);

    res.status(200).json({
      success: true,
      data: {
        visitor: {
          id: visitor._id,
          name: visitor.name,
          phone: visitor.phone,
          status: visitor.status,
          purpose: visitor.purpose,
          expectedDate: visitor.expectedDate,
          checkInAt: visitor.checkInAt,
          checkOutAt: visitor.checkOutAt,
          qrCode: visitor.status === 'pending' ? visitor.qrCode : undefined,
          resident: visitor.resident,
        },
      },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    Visitor history by phone
 * @route   GET /api/visitor/history?phone=
 * @access  Public
 */
export const getHistory = asyncHandler(async (req, res) => {
  const { phone } = req.query;

  if (!phone?.trim()) {
    res.status(400);
    throw new Error('Phone query parameter is required');
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(20, parseInt(req.query.limit, 10) || 10);

  const result = await getVisitorHistoryByPhone(phone, { page, limit });

  res.status(200).json({
    success: true,
    data: result,
  });
});
