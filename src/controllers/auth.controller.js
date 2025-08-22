import User from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import { setOTP, getOTP, deleteOTP } from "../utils/otpStore.js";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";


// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, password, name, email, phone, role, status} = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        message: "Email already in use",
      });
    }

    // Create new user
    const user = new User({
      username,
      password, // Will be hashed by pre-save hook
      name,
      email,
      phone,
      profile_created : null ,
      profile_id : null,
      role: role || "U",
      status: status || "A",
    });


    await user.save();

    // Return response without password
    const userObj = user.toObject();
    delete userObj.password;

    

    res.status(201).json({
      status: true,
      message: "User registered successfully",
      user: userObj,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error occurred while registering user",
      err : err
    });
  }
};

export const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isMatched = await user.comparePassword(password);
    if (!isMatched)
      return res.status(401).json({ message: "Invalid Password" });


    // Check if user is active
    if (user.status !== "A") {
      return res.status(403).json({
        status: false,
        message: "Account is inactive",
      });
    }


    const token = generateToken(user._id, user.role);

    // Update last login
    user.last_login = new Date();
    await user.save();

    // Return response without password
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      status: true,
      message: "Login successful",
      user: userObj,
      token,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error occurred while logging in",
    });
  }
};



// 1. Send OTP to email
export const requestOTP = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found." });

  const otp = generateOTP();
  setOTP(email, otp);

  await sendEmail(email, "Your OTP Code", `Your OTP is: ${otp}`);

  res.json({ message: "OTP sent to email." });
};

// 2. Verify OTP
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  const storedOtp = getOTP(email);
  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  res.json({ message: "OTP verified successfully." });
};

// 3. Reset Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const storedOtp = getOTP(email);
  if (!storedOtp || storedOtp !== otp) {
    return res.status(400).json({ message: "Invalid or expired OTP." });
  }

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found." });

  user.password = newPassword;
  await user.save();

  deleteOTP(email);

  res.json({ message: "Password updated successfully." });
};
