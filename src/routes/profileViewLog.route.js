import express from "express";
import { body } from "express-validator";

const router = express.Router();

// Log a profile view
router.post("/", [
  body("viewer_profile_id")
    .trim()
    .notEmpty()
    .withMessage("Viewer profile ID is required")
    .isLength({ max: 50 })
    .withMessage("Viewer profile ID cannot exceed 50 characters"),

  body("viewed_profile_id")
    .trim()
    .notEmpty()
    .withMessage("Viewed profile ID is required")
    .isLength({ max: 50 })
    .withMessage("Viewed profile ID cannot exceed 50 characters"),
]);

// Get views by viewer profile ID
router.get("/viewer/:profile_id");

// Get views of a profile (who viewed this profile)
router.get("/viewed/:profile_id");

// Get mutual views between two profiles
router.get("/mutual/:profile1_id/:profile2_id");

export default router;
