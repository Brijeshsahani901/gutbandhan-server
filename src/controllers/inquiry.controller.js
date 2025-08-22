import Inquiry from "../models/inquiry.model.js";
import { validationResult } from "express-validator";

export const createInquiry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }

  try {
    const { inquiry_from, inquiry_for, message } = req.body;

    const newInquiry = new Inquiry({
      inquiry_from,
      inquiry_for,
      message,
    });

    await newInquiry.save();

    return res.status(201).json({
      status: true,
      message: "Inquiry created successfully",
      data: newInquiry,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error creating inquiry",
      error: err.message,
    });
  }
};

export const getInquiries = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }
  try {
    const { from, for: inquiryFor, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (from) filter.inquiry_from = from;
    if (inquiryFor) filter.inquiry_for = inquiryFor;

    const [inquiries, total] = await Promise.all([
      Inquiry.find(filter)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .sort({ inquiry_timestamp: -1 }),
      Inquiry.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: true,
      count: inquiries.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: inquiries,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error fetching inquiries",
      error: err.message,
    });
  }
};

export const getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        status: false,
        message: "Inquiry not found",
      });
    }

    return res.status(200).json({
      status: true,
      data: inquiry,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error fetching inquiry",
      error: err.message,
    });
  }
};

export const deleteInquiry = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        status: false,
        message: "Inquiry not found",
      });
    }

    await Inquiry.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      status: true,
      message: "Inquiry deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error fetching inquiry",
      error: err.message,
    });
  }
};
