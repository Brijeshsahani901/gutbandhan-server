import mongoose from "mongoose";

const partnerPreferenceSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
    },
    age: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    marital_status: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    body_type: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    complexion: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },
    height: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    eating_habit: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    manglik: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    religion: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    caste: {
      type: String,
      required: true,
    },
    marry_any_caste: {
      type: String,
      required: true,
      enum: ["Y", "N", "U"],
    },
    native: {
      type: String,
      trim: true,
    },
    mother_tongue: {
      type: String,
      trim: true,
    },
    education: {
      type: String,
      trim: true,
    },
    occupation: {
      type: String,
      required: true,
      trim: true,
    },
    employed_in: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    residential_status: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    star: {
      type: String,
      trim: true,
    },
    family_type: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    smoking: {
      type: String,
      enum: ["A", "N", "O", "Y"],
    },
    drinking: {
      type: String,
      trim: true,
      maxlength: 10,
    },
    residing_country: {
      type: String,
      required: true,
      trim: true,
    },
    residing_state: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    residing_city: {
      type: String,
      trim: true,
      maxlength: 200,
    },
  },
  {
    timestamps: false,
  }
);

const PartnerPreference = mongoose.model("PartnerPreference", partnerPreferenceSchema);

export default PartnerPreference;