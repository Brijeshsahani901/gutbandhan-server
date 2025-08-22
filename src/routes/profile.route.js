import express from "express";
import { body, param } from "express-validator";
import multer from "multer";
import path from "path";
import {
  updateProfile,
  createProfile,
  getOneProfile,
  searchProfiles,
  deleteProfile,
  getAllProfiles,
  getAcceptedChatProfiles,
  getDashboardStats,
} from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), "uploads"));
  },

  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only images are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5, // Max 5 files
  },
});

router.get("/search", protect, searchProfiles);
router.get("/dashboard/stats", getDashboardStats);
router.get("/accepted", protect, getAcceptedChatProfiles);

router.get("/:profileId", protect, getOneProfile);
router.put(
  "/:profile_id",

  protect,
  upload.array("photos", 5),
  updateProfile
);

router.delete(
  "/:profileId",
  [
    param("profileId")
      .notEmpty()
      .withMessage("User ID is required")
      .isMongoId()
      .withMessage("Invalid user ID format"),
  ],
  protect,
  deleteProfile
);
router.get("/", protect, getAllProfiles);

router.post(
  "/",
  protect,
  upload.array("photos", 5),
  [
    body("first_name")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ max: 150 })
      .withMessage("First name cannot exceed 150 characters"),
    body("last_name")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ max: 150 })
      .withMessage("Last name cannot exceed 150 characters"),
    // body("dob").isISO8601().withMessage("Invalid date format (YYYY-MM-DD)"),
    // body("sex").isIn(["M", "F"]).withMessage("Sex must be M or F"),
    body("marital_status")
      .isIn(["Single", "Married", "Divorced", "Widowed", "Separated"])
      .withMessage("Invalid marital status"),
  ],
  createProfile
);

export default router;
