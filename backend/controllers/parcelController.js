/**
 * Parcel Controller — unified parcel module endpoints
 */
import asyncHandler from '../utils/asyncHandler.js';
import {
  createParcel,
  listParcels,
  getParcelById,
  updateParcelStatus,
  notifyResident,
  getParcelStats,
  markParcelCollectedByResident,
} from '../services/parcelService.js';

const handleServiceError = (res, error) => {
  if (error.statusCode) res.status(error.statusCode);
  throw error;
};

/**
 * @desc    Add parcel (guard)
 * @route   POST /api/parcels
 * @access  Private (guard)
 */
export const addParcel = asyncHandler(async (req, res) => {
  const { trackingId, courier, description, residentId } = req.body;

  if (!residentId) {
    res.status(400);
    throw new Error('Resident is required');
  }

  try {
    const parcel = await createParcel({
      trackingId,
      courier,
      description,
      residentId,
      receivedById: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Parcel logged and resident notified',
      data: { parcel },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    My parcels (resident history)
 * @route   GET /api/parcels/mine
 * @access  Private (resident)
 */
export const getMyParcels = asyncHandler(async (req, res) => {
  const result = await listParcels({ resident: req.user._id }, req.query);

  res.status(200).json({ success: true, data: result });
});

/**
 * @desc    All parcels (guard / admin)
 * @route   GET /api/parcels
 * @access  Private (guard, admin)
 */
export const getAllParcels = asyncHandler(async (req, res) => {
  const result = await listParcels({}, req.query);

  res.status(200).json({ success: true, data: result });
});

/**
 * @desc    Parcel stats
 * @route   GET /api/parcels/stats
 * @access  Private (guard, admin)
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await getParcelStats();

  res.status(200).json({ success: true, data: { stats } });
});

/**
 * @desc    Get single parcel
 * @route   GET /api/parcels/:id
 * @access  Private (resident own / guard / admin)
 */
export const getParcel = asyncHandler(async (req, res) => {
  try {
    const filter =
      req.user.role === 'resident' ? { residentId: req.user._id } : {};

    const parcel = await getParcelById(req.params.id, filter);

    res.status(200).json({ success: true, data: { parcel } });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    Update parcel status
 * @route   PATCH /api/parcels/:id
 * @access  Private (guard, admin)
 */
export const updateParcel = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Status is required');
  }

  try {
    const parcel = await updateParcelStatus({
      parcelId: req.params.id,
      status,
      actorId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Parcel updated',
      data: { parcel },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    Notify resident to pick up parcel
 * @route   PATCH /api/parcels/:id/notify
 * @access  Private (guard)
 */
export const notifyParcel = asyncHandler(async (req, res) => {
  try {
    const parcel = await notifyResident(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Resident notified for pickup',
      data: { parcel },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    Confirm parcel collection by resident
 * @route   PATCH /api/parcels/:id/collect
 * @access  Private (resident)
 */
export const collectParcel = asyncHandler(async (req, res) => {
  try {
    const parcel = await markParcelCollectedByResident({
      parcelId: req.params.id,
      residentId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Parcel confirmed as collected',
      data: { parcel },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

