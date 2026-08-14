/**
 * Visitor Model — guests visiting a resident.
 * Guard module will add QR check-in/out; residents view their list.
 */
import mongoose from 'mongoose';

const visitorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Visitor name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Visitor phone is required'],
      trim: true,
    },
    purpose: {
      type: String,
      trim: true,
      default: 'Personal visit',
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    apartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Apartment',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'checked-in', 'checked-out', 'expired', 'cancelled'],
      default: 'pending',
    },
    // Secret token embedded in QR — used to verify scans
    qrToken: {
      type: String,
      default: '',
    },
    // Base64 data URL of generated QR image
    qrCode: {
      type: String,
      default: '',
    },
    qrIssuedAt: Date,
    lastScannedAt: Date,
    checkInAt: Date,
    checkOutAt: Date,
    expectedDate: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

const Visitor = mongoose.model('Visitor', visitorSchema);

export default Visitor;
