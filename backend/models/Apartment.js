/**
 * Apartment Model — building units residents can be linked to.
 * Full admin CRUD comes in the Admin module; schema is ready now.
 */
import mongoose from 'mongoose';

const apartmentSchema = new mongoose.Schema(
  {
    block: {
      type: String,
      required: [true, 'Block is required'],
      trim: true,
    },
    unitNumber: {
      type: String,
      required: [true, 'Unit number is required'],
      trim: true,
    },
    floor: {
      type: Number,
      default: 1,
    },
    type: {
      type: String,
      enum: ['1BHK', '2BHK', '3BHK', 'studio', 'other'],
      default: '2BHK',
    },
    isOccupied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// One unit per block (e.g. A-101 is unique)
apartmentSchema.index({ block: 1, unitNumber: 1 }, { unique: true });

const Apartment = mongoose.model('Apartment', apartmentSchema);

export default Apartment;
