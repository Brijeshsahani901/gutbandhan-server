import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    profile_id: {
      type: String,
      unique: true,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    created_for: {
      type: String,
      required: true,
      enum: [
        "Myself",
        "Brother",
        "Sister",
        "Son",
        "Daughter",
        "Friend",
        "Relative",
      ],
    },
    first_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    residing_city: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 200,
    },
    residing_state: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 200,
    },
    residing_country: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 150,
    },
    residing_status: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    marital_status: {
      type: String,
      // required: true,
      enum: ["Single", "Married", "Divorced", "Widowed", "Separated"],
    },
    body_type: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    dob: {
      type: Date,
      // required: true,
    },
    tob: {
      type: String,
      trim: true,
      maxlength: 10,
    },
    height: {
      type: String,
      default: "0",
      trim: true,
      maxlength: 50,
    },
    weight: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    complexion: {
      type: String,
      trim: true,
      maxlength: 50,
    },
    blood_group: {
      type: String,
      trim: true,
      maxlength: 3,
    },
    sex: {
      type: String,
      // required: true,
      enum: ["M", "F"],
      uppercase: true,
    },
    mother_tongue: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 50,
    },
    religion: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 50,
    },
    star: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    caste: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 100,
    },
    sub_caste: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 50,
    },
    raashi: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 50,
    },
    role: {
      type: String,
      enum: ["A", "U", "P"],
      // required: true,
    },
    manglik: {
      type: String,
      enum: ["Y", "N", "U"],
      uppercase: true,
    },
    birth_place: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 150,
    },
    native_place: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
    mobile: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 20,
    },
    mobile_verified: {
      type: String,
      enum: ["Y", "N"],
      default: "N",
      uppercase: true,
    },
    edu_career_about: {
      type: String,
      trim: true,
    },
    education: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 250,
    },
    occupation: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 250,
    },
    working_with: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    professional_area: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    eating_habit: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 20,
    },
    physical_status: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 150,
    },
    smoking: {
      type: String,
      enum: ["Y", "N", "U"],
      uppercase: true,
    },
    drinking: {
      type: String,
      enum: ["Y", "N", "U"],
      uppercase: true,
    },
    hobby: {
      type: String,
      // required: true,
      trim: true,
      maxlength: 250,
    },
    photos: {
      type: [String],
      default: [],
    },

    annual_income: {
      type: String,
      default: "0",
      trim: true,
      maxlength: 11,
    },
    family_type: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    family_value: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    family_status: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    sisters: {
      type: String,
      trim: true,
      maxlength: 4,
    },
    brothers: {
      type: String,
      trim: true,
      maxlength: 4,
    },
    brother_marital_status: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    sister_marital_status: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    mother_occupation: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    father_occupation: {
      type: String,
      trim: true,
      maxlength: 250,
    },
    about: {
      type: String,
      trim: true,
    },
    thalassemia: {
      type: String,
      trim: true,
      maxlength: 112,
    },
    rotary_club: {
      type: String,
      trim: true,
      maxlength: 112,
    },
    district_no: {
      type: String,
      trim: true,
      maxlength: 112,
    },
    fb_url: {
      type: String,
      trim: true,
    },
    twitter_url: {
      type: String,
      trim: true,
    },
    gplus_url: {
      type: String,
      trim: true,
    },
    linkedin_url: {
      type: String,
      trim: true,
    },
    paid_member: {
      type: String,
      enum: ["Y", "N"],
      default: "N",
      uppercase: true,
    },
    membership_expired_on: {
      type: Date,
      default: Date.now,
    },
  
    added_timestamp: {
      type: Date,
      default: Date.now,
    },
    updated_timestamp: {
      type: Date,
      default: Date.now,
    },
    free_email_used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: false, // We're handling timestamps manually
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Update the updated_timestamp field before saving
profileSchema.pre("save", function (next) {
  this.updated_timestamp = new Date();
  next();
});

// Virtual for full name
profileSchema.virtual("full_name").get(function () {
  return `${this.first_name} ${this.last_name}`;
});

// Search filters
profileSchema.index({ religion: 1, caste: 1, sub_caste: 1 });
profileSchema.index({ star: 1, raashi: 1, manglik: 1 });
profileSchema.index({
  residing_country: 1,
  residing_state: 1,
  residing_city: 1,
});

// Date of birth (for age filters)
profileSchema.index({ dob: 1 });

// Full-text search (used for free-text fields)
profileSchema.index({
  education: "text",
  occupation: "text",
  working_with: "text",
});

// Profile activity (sorting by recent updates)
profileSchema.index({ updated_timestamp: -1 });

const Profile = mongoose.model("Profile", profileSchema);

export default Profile;
