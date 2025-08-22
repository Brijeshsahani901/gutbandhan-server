import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profile_created: {
      type: Boolean,
      default: false,
    },
    profile_id: {
      type: String,
      sparse: true,
    },
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      enum: ["A", "U", "P"],
    },
    status: {
      type: String,
      enum: ["A", "I"],
      default: "A",
    },
    last_login: {
      type: Date,
    },
    timestamp_added: {
      type: Date,
      default: Date.now,
    },
    timestamp_updated: {
      type: Date,
      default: Date.now,
    },
    free_email_used: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: false,
  }
);

userSchema.pre("save", async function (next) {
  this.timestamp_updated = new Date();
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
