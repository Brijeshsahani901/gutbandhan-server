import express from "express";
import { body,param } from "express-validator";
import {
  createPreference,
  updatePreference,
  getPreferenceByEmail,
  deletePreference,
  getAllPreferences,
} from "../controllers/partnerPreference.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Create or update partner preference
router.post(
  "/",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("age").optional().isString().withMessage("Age must be a string"),
    body("marital_status").optional().isString(),
    body("body_type").optional().isString(),
    body("complexion").optional().isString(),
    body("height").optional().isString(),
    body("eating_habit").optional().isString(),
    body("manglik").optional().isString(),
    body("religion").optional().isString(),
    body("caste").optional().isString(),
    body("marry_any_caste").optional().isIn(["Y", "N", "U"]),
    body("native").optional().isString(),
    body("mother_tongue").optional().isString(),
    body("education").optional().isString(),
    body("occupation").optional().isString(),
    body("employed_in").optional().isString(),
    body("residential_status").optional().isString(),
    body("star").optional().isString(),
    body("family_type").optional().isString(),
    body("smoking").optional().isIn(["A", "N", "O", "Y"]),
    body("drinking").optional().isString(),
    body("residing_country").optional().isString(),
    body("residing_state").optional().isString(),
    body("residing_city").optional().isString(),
  ],
  protect, // Assuming protect middleware is used for authentication
  createPreference
);

router.put(
  "/:email",
  [
    param("email")
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("email is required"),
  ],
  protect,
  updatePreference
);

router.get("/", protect, getAllPreferences);

// Get partner preference by email
router.get(
  "/:email",
  [
    param("email")
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("email is required"),
  ],
  protect,
  getPreferenceByEmail
);

// Delete partner preference
router.delete("/:email", [
    param("email")
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("email is required"),
  ], protect, deletePreference);

export default router;
