import express from "express";
import { body, param, query } from "express-validator";
import {
  createInquiry,
  deleteInquiry,
  getInquiries,
  getInquiryById,
} from "../controllers/inquiry.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  [
    body("inquiry_from")
      .trim()
      .notEmpty()
      .withMessage("Inquiry from is required")
      .isLength({ max: 250 })
      .withMessage("Maximum 250 characters allowed"),
    body("inquiry_for")
      .trim()
      .notEmpty()
      .withMessage("Inquiry for is required")
      .isLength({ max: 250 })
      .withMessage("Maximum 250 characters allowed"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  createInquiry
);

router.get(
  "/",
  protect,
  [
    query("from").optional().trim().isLength({ max: 250 }),
    query("for").optional().trim().isLength({ max: 250 }),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  getInquiries
);

router.get(
  "/:id",
  protect,
  [
    param("id")
      .notEmpty()
      .withMessage("Inquiry ID is required")
      .isMongoId()
      .withMessage("Invalid inquiry ID format"),
  ],
  getInquiryById
);

router.delete(
  "/:id",
  protect,
  [
    param("id")
      .notEmpty()
      .withMessage("Inquiry ID is required")
      .isMongoId()
      .withMessage("Invalid inquiry ID format"),
  ],
  deleteInquiry
);

export default router;
