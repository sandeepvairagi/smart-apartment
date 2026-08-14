/**
 * Notice Model — announcements published by admin.
 */
import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      trim: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

const Notice = mongoose.model('Notice', noticeSchema);

export default Notice;
