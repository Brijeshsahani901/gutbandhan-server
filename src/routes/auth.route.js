import express from "express";
import { body } from "express-validator";
import { login, register, requestOTP, resetPassword, verifyOTP } from "../controllers/auth.controller.js";

const router = express.Router();

router.post(
  "/register",
  [
    // body("username")
    //   .trim()
    //   .notEmpty()
    //   .withMessage("Username is required")
    //   .isLength({ min: 3 })
    //   .withMessage("Username must be at least 3 characters"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .withMessage(
        "Password must contain at least one uppercase, one lowercase, one number and one special character"
      ),

    // body("name")
    //   .trim()
    //   .notEmpty()
    //   .withMessage("Name is required")
    //   .isLength({ max: 150 })
    //   .withMessage("Name cannot exceed 150 characters"),

    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    // body("phone")
    //   .optional()
    //   .isMobilePhone()
    //   .withMessage("Invalid phone number"),

  ],
  register
);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),

    body("password").trim().notEmpty().withMessage("Password is required"),
  ],
  login
);


router.post("/forgot-password", requestOTP);    // Send OTP
router.post("/verify-otp", verifyOTP);          // Verify OTP
router.post("/reset-password", resetPassword); 


export default router;
