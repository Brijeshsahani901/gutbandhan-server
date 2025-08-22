import express from "express";
import { body, param, query } from "express-validator";
import {
  expressInterest,
  respondToInterest,
  getInterestsReceived,
  getInterestsSent,
  removeInterest,
  getAllInterests,
  searchInterestByProfiles,
} from "../controllers/interested.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Express interest in a profile
router.post(
  "/express",
  [
    body("interest_from_pid")
      .trim()
      .notEmpty()
      .withMessage("Your profile ID is required")
      .isLength({ max: 50 })
      .withMessage("Profile ID too long"),

    body("interested_in_pid")
      .trim()
      .notEmpty()
      .withMessage("Target profile ID is required")
      .isLength({ max: 50 })
      .withMessage("Profile ID too long"),

    body("interest_msg")
      .trim()
      .notEmpty()
      .withMessage("Interest message is required")
      .isLength({ max: 200 })
      .withMessage("Message cannot exceed 200 characters"),
  ],
  protect,
  expressInterest
);

// Respond to an interest
router.put(
  "/respond/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("Interest ID is required")
      .isMongoId()
      .withMessage("Invalid interest ID"),

    body("response_msg")
      .trim()
      .notEmpty()
      .withMessage("Response message is required")
      .isLength({ max: 200 })
      .withMessage("Response cannot exceed 200 characters"),

    body("interest_status")
      .notEmpty()
      .withMessage("Response status is required")
      .isIn(["A", "D"])
      .withMessage("Status must be either A (Accepted) or D (Declined)"),
  ],
  protect,
  respondToInterest
);

// Get interests received by a profile
router.get(
  "/received/:pid",
  [
    param("pid")
      .notEmpty()
      .withMessage("Profile ID is required")
      .isLength({ max: 50 })
      .withMessage("Profile ID too long"),

    query("status")
      .optional()
      .isIn(["A", "D", "P"])
      .withMessage("Status must be A, D, or P"),
  ],
  protect,
  getInterestsReceived
);

// Get interests sent by a profile
router.get(
  "/sent/:pid",
  [
    param("pid")
      .notEmpty()
      .withMessage("Profile ID is required")
      .isLength({ max: 50 })
      .withMessage("Profile ID too long"),

    query("status")
      .optional()
      .isIn(["A", "D", "P"])
      .withMessage("Status must be A, D, or P"),
  ],
  protect,
  getInterestsSent
);

router.get(
  "/",
  protect,
  getAllInterests
);

router.get("/search", searchInterestByProfiles);

// Remove an interest
router.delete(
  "/:id",
  [
    param("id")
      .notEmpty()
      .withMessage("Interest ID is required")
      .isMongoId()
      .withMessage("Invalid interest ID"),

    body("requester_profile_id")
      .trim()
      .notEmpty()
      .withMessage("Your profile ID is required")
      .isLength({ max: 50 })
      .withMessage("Profile ID too long"),
  ],
  protect,
  removeInterest
);

export default router;
