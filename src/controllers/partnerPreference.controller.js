import PartnerPreference from "../models/partnerPreference.model.js";
import { validationResult } from "express-validator";

export const createPreference = async (req, res) => {
   const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        errors: errors.array(),
      });
    }
  try {
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        status: false,
        message: "Email is required",
      });
    }

    // Check if preference already exists for this email
    const existingPreference = await PartnerPreference.findOne({ email });
    if (existingPreference) {
      return res.status(409).json({
        status: false,
        message: "Partner preference already exists for this email",
      });
    }

    // Create new preference
    const newPreference = new PartnerPreference(req.body);
    await newPreference.save();

    return res.status(201).json({
      status: true,
      message: "Partner preference created successfully",
      data: newPreference,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error creating partner preference",
      error: err.message,
    });
  }
};

export const updatePreference = async (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        errors: errors.array(),
      });
    }
  try {
    const { email } = req.params;
    const updateData = req.body;

    // Validate that email in params matches body if provided
    if (updateData.email && updateData.email !== email) {
      return res.status(400).json({
        status: false,
        message: "Email in body does not match URL parameter",
      });
    }

    // Check if preference exists
    const existingPreference = await PartnerPreference.findOne({ email });
    if (!existingPreference) {
      return res.status(404).json({
        status: false,
        message: "Partner preference not found",
      });
    }

    // Update preference
    const updatedPreference = await PartnerPreference.findOneAndUpdate(
      { email },
      updateData,
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      status: true,
      message: "Partner preference updated successfully",
      data: updatedPreference,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error updating partner preference",
      error: err.message,
    });
  }
};

export const getPreferenceByEmail = async (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        errors: errors.array(),
      });
    }
  try {
    const { email } = req.params;

    const preference = await PartnerPreference.findOne({ email });

    if (!preference) {
      return res.status(404).json({
        status: false,
        message: "Partner preference not found",
      });
    }

    return res.status(200).json({
      status: true,
      data: preference,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error fetching partner preference",
      error: err.message,
    });
  }
};

export const getAllPreferences = async (req, res) => {
  try {
    // Optional pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Optional filtering
    const filter = {};
    if (req.query.religion) filter.religion = req.query.religion;
    if (req.query.age) filter.age = req.query.age;
    // Add more filters as needed

    // Get preferences with pagination
    const preferences = await PartnerPreference.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Count total documents for pagination info
    const total = await PartnerPreference.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      status: true,
      data: preferences,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error fetching partner preferences",
      error: err.message,
    });
  }
};

export const deletePreference = async (req, res) => {
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: false,
        errors: errors.array(),
      });
    }
  try {
    const { email } = req.params;

    const result = await PartnerPreference.findOneAndDelete({ email });

    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Partner preference not found",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Partner preference deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error deleting partner preference",
      error: err.message,
    });
  }
};