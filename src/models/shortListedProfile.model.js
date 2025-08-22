import mongoose from "mongoose";

const shortlistedProfileSchema = new mongoose.Schema({
  shortlisted_by_pid: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  shortlisted_pid: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  shortlisted_timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // We're handling the timestamp manually
});

// Compound index to prevent duplicate shortlistings
shortlistedProfileSchema.index(
  { shortlisted_by_pid: 1, shortlisted_pid: 1 },
  { unique: true }
);

// Index for faster queries
shortlistedProfileSchema.index({ shortlisted_by_pid: 1 });
shortlistedProfileSchema.index({ shortlisted_pid: 1 });

const ShortlistedProfile = mongoose.model('ShortlistedProfile', shortlistedProfileSchema);

export default ShortlistedProfile;