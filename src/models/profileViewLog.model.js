import mongoose from "mongoose";

const profileViewLogSchema = new mongoose.Schema({
  viewer_profile_id: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  viewed_profile_id: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  viewed_timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false 
});

// Index for faster queries
profileViewLogSchema.index({ viewer_profile_id: 1 });
profileViewLogSchema.index({ viewed_profile_id: 1 });

const ProfileViewLog = mongoose.model('ProfileViewLog', profileViewLogSchema);

export default ProfileViewLog;