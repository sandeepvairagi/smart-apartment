/**
 * Parcel Model — deliveries for residents.
 */
import mongoose from 'mongoose';

const parcelSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      trim: true,
      default: '',
    },
    courier: {
      type: String,
      trim: true,
      default: 'Unknown',
    },
    description: {
      type: String,
      trim: true,
      default: 'Parcel',
    },
    status: {
      type: String,
      enum: ['received', 'notified', 'delivered', 'returned'],
      default: 'received',
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
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deliveredAt: Date,
  },
  { timestamps: true }
);

const Parcel = mongoose.model('Parcel', parcelSchema);

export default Parcel;
