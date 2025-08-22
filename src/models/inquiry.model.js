import mongoose from 'mongoose';

const inquirySchema = new mongoose.Schema({
  inquiry_from: {
    type: String,
    required: true,
    trim: true,
    maxlength: 250
  },
  inquiry_for: {
    type: String,
    required: true,
    trim: true,
    maxlength: 250
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  inquiry_timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false 
});

// Indexes
inquirySchema.index({ inquiry_from: 1 });
inquirySchema.index({ inquiry_for: 1 });
inquirySchema.index({ inquiry_timestamp: -1 });

const Inquiry = mongoose.model('Inquiry', inquirySchema);

export default Inquiry;