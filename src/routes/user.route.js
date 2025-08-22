import express from "express";
import { body, query, param } from "express-validator";
import {
  getOne,
  getAllUsers,
  updateUser,
  searchUsers,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Correct order of routes:
// 1. Static routes first (most specific)
// 2. Dynamic routes later (least specific)
// 3. Root route last

router.get("/search", protect, searchUsers);

router.get(
  "/:id",
  protect,
  [
    param("id")
      .notEmpty()
      .withMessage("User ID is required")
      .isMongoId()
      .withMessage("Invalid user ID format"),
  ],
  getOne
);

router.get("/", protect, getAllUsers);

router.put(
  "/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("User ID is required")
      .isMongoId()
      .withMessage("Invalid user ID format"),
  ],
  protect,
  updateUser
);

router.post(
  "/change-password",
  protect,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),

    body("newPassword")
      .notEmpty()
      .withMessage("New password is required")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage(
        "New password must contain uppercase, lowercase, number, and special character"
      ),
  ],
);

export default router;