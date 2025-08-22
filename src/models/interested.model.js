import mongoose from "mongoose";

const interestedSchema = new mongoose.Schema({
  interest_from_pid: {
    type: String,
    trim: true,
    maxlength: 50
  },
  interested_in_pid: {
    type: String,
    trim: true,
    maxlength: 50
  },
  interest_msg: {
    type: String,
    trim: true,
    maxlength: 200
  },
  response_msg: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ""
  },
  interest_status: {
    type: String,
    enum: ['A', 'D', 'P'], // A=Accepted, D=Declined, P=Pending
    default: 'P'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate interest entries
interestedSchema.index(
  { interest_from_pid: 1, interested_in_pid: 1 },
  { unique: true }
);

// Indexes for faster queries
interestedSchema.index({ interest_from_pid: 1 });
interestedSchema.index({ interested_in_pid: 1 });
interestedSchema.index({ interest_status: 1 });

const Interested = mongoose.model('Interested', interestedSchema);

export default Interested;