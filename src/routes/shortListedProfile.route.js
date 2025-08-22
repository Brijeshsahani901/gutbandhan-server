import express from "express";
import { body, param } from "express-validator";
import {
  shortlistProfile,
  getShortlistedProfiles,
  removeShortlistedProfile,
  getAllShortlistedProfiles,
  getAllShortlistedProfilesByMe,
} from "../controllers/shortListedProfile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  [
    body("shortlisted_by_pid")
      .trim()
      .notEmpty()
      .withMessage("shortlisted by pid is required"),
    body("shortlisted_pid")
      .trim()
      .notEmpty()
      .withMessage("shortlisted pid is required"),
  ],
  protect,
  shortlistProfile
);

router.get("/", protect, getAllShortlistedProfiles);
router.get("/shortlisted-by-me", protect, getAllShortlistedProfilesByMe);

router.get(
  "/:pid",
  [param("pid").trim().notEmpty().withMessage("Your profile ID is required")],
  protect,
  getShortlistedProfiles
);

router.delete(
  "/",
  [
    body("shortlisted_by_pid")
      .trim()
      .notEmpty()
      .withMessage("shortlisted by pid is required"),
    body("shortlisted_pid")
      .trim()
      .notEmpty()
      .withMessage("shortlisted pid is required"),
  ],
  protect,
  removeShortlistedProfile
);

export default router;
