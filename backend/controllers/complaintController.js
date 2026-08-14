/**
 * Complaint Controller — unified complaint module endpoints
 */
import asyncHandler from '../utils/asyncHandler.js';
import {
  createComplaint,
  listComplaints,
  getComplaintById,
  updateComplaintStatus,
  resolveComplaint,
  getComplaintStats,
} from '../services/complaintService.js';

const handleServiceError = (res, error) => {
  if (error.statusCode) res.status(error.statusCode);
  throw error;
};

/**
 * @desc    Raise complaint (resident)
 * @route   POST /api/complaints
 * @access  Private (resident)
 */
export const raiseComplaint = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;

  if (!title?.trim() || !description?.trim()) {
    res.status(400);
    throw new Error('Title and description are required');
  }

  const complaint = await createComplaint({
    title,
    description,
    category,
    residentId: req.user._id,
    apartmentId: req.user.apartment || null,
  });

  res.status(201).json({
    success: true,
    message: 'Complaint raised successfully',
    data: { complaint },
  });
});

/**
 * @desc    My complaints (resident history)
 * @route   GET /api/complaints/mine
 * @access  Private (resident)
 */
export const getMyComplaints = asyncHandler(async (req, res) => {
  const result = await listComplaints({ resident: req.user._id }, req.query);

  res.status(200).json({ success: true, data: result });
});

/**
 * @desc    All complaints (admin)
 * @route   GET /api/complaints
 * @access  Private (admin)
 */
export const getAllComplaints = asyncHandler(async (req, res) => {
  const result = await listComplaints({}, req.query);

  res.status(200).json({ success: true, data: result });
});

/**
 * @desc    Complaint stats
 * @route   GET /api/complaints/stats
 * @access  Private (admin)
 */
export const getStats = asyncHandler(async (req, res) => {
  const stats = await getComplaintStats();

  res.status(200).json({ success: true, data: { stats } });
});

/**
 * @desc    Get single complaint
 * @route   GET /api/complaints/:id
 * @access  Private (resident own / admin any)
 */
export const getComplaint = asyncHandler(async (req, res) => {
  try {
    const filter =
      req.user.role === 'resident' ? { residentId: req.user._id } : {};

    const complaint = await getComplaintById(req.params.id, filter);

    res.status(200).json({ success: true, data: { complaint } });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    Update complaint status (admin)
 * @route   PATCH /api/complaints/:id
 * @access  Private (admin)
 */
export const updateComplaint = asyncHandler(async (req, res) => {
  try {
    const complaint = await updateComplaintStatus({
      complaintId: req.params.id,
      status: req.body.status,
      resolution: req.body.resolution,
      adminId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Complaint updated',
      data: { complaint },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});

/**
 * @desc    Resolve complaint with notes (admin)
 * @route   PATCH /api/complaints/:id/resolve
 * @access  Private (admin)
 */
export const resolveComplaintHandler = asyncHandler(async (req, res) => {
  try {
    const complaint = await resolveComplaint({
      complaintId: req.params.id,
      resolution: req.body.resolution,
      adminId: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: 'Complaint resolved',
      data: { complaint },
    });
  } catch (error) {
    handleServiceError(res, error);
  }
});
