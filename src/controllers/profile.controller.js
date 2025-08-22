import mongoose from "mongoose";
import { validationResult } from "express-validator";
import Profile from "../models/profile.model.js";
import Interested from "../models/interested.model.js";
import User from "../models/user.model.js";
import path from "path";
import fs from "fs";

export const createProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });

  try {
    const userId = req.user._id;
    const profileData = req.body;
    const files = req.files || [];
    // Get user
    const user = await User.findById(userId).select("email");
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const existingProfile = await Profile.findOne({ email: profileData.email });
    if (existingProfile) {
      return res
        .status(404)
        .json({ status: false, message: "Profile Already exist" });
    }

    // Generate unique profile ID
    profileData.profile_id = `MP${Date.now()}`;
    profileData.created_by = userId;
    profileData.photos = files.map((file) =>
      path.join("/uploads", file.filename)
    );

    const profile = new Profile(profileData);
    await profile.save();

    return res.status(201).json({
      status: true,
      message: "Profile created successfully",
      profile,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Server error while creating profile",
      error: err.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: false, errors: errors.array() });
  }

  try {
    const { profile_id } = req.params;
    if (!profile_id) {
      return res.status(404).json({ status: false, message: "id not found" });
    }

    const userId = req.user._id;
    const profileData = req.body;
    const files = req.files || [];
    const existingPhotos = JSON.parse(req.body.existingPhotos || "[]");

    const profile = await Profile.findById(profile_id);
    if (!profile) {
      return res
        .status(404)
        .json({ status: false, message: "Profile not found" });
    }

    // 🔥 Delete old photos
    // const oldPhotos = profile.photos || [];
    // for (const photoPath of oldPhotos) {
    //   const safePhotoPath = path.normalize(photoPath);
    //   const fullPath = path.resolve(process.cwd(), "." + safePhotoPath);
    //   try {
    //     if (fs.existsSync(fullPath)) {
    //       fs.unlinkSync(fullPath);
    //     }
    //   } catch (err) {
    //     console.warn("Failed to delete old photo:", photoPath, err.message);
    //   }
    // }

    const oldPhotos = profile.photos || [];
    for (const photoPath of oldPhotos) {
      if (!existingPhotos.includes(photoPath)) {
        const safePhotoPath = path.normalize(photoPath);
        const fullPath = path.resolve(process.cwd(), "." + safePhotoPath);
        try {
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        } catch (err) {
          console.warn("Failed to delete photo:", photoPath, err.message);
        }
      }
    }

    // 📤 Update with new data + new photos
    const updatedPhotos = [
      ...existingPhotos,
      ...files.map((file) => path.join("/uploads", file.filename)),
    ];

    const updatedProfile = await Profile.findOneAndUpdate(
      { _id: profile_id },
      {
        $set: {
          ...profileData,
          photos: updatedPhotos,
          updated_timestamp: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Server error while updating profile",
      error: err.message,
    });
  }
};

export const getOneProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }

  try {
    const { profileId } = req.params;
    let profile = null;
    // Try to find by profile_id first
    profile = await Profile.findOne({ profile_id: profileId }).lean();

    // If not found, and profileId is a valid Mongo ObjectId, try by _id
    if (!profile && mongoose.Types.ObjectId.isValid(profileId)) {
      profile = await Profile.findById(profileId).lean();
    }

    if (!profile) {
      return res.status(404).json({
        status: false,
        message: "Profile not found",
      });
    }

    // Remove sensitive fields if needed
    delete profile.__v;
    delete profile.updatedAt;

    return res.status(200).json({
      status: true,
      profile,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Server error while fetching profile",
      error: err.message,
    });
  }
};

export const getAllProfiles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const currentProfileId = req.user?.profile_id;

    const query = currentProfileId
      ? { profile_id: { $ne: currentProfileId } } // exclude own profile
      : {};

    const profiles = await Profile.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalProfiles = await Profile.countDocuments(query);

    res.status(200).json({
      status: true,
      currentPage: page,
      totalPages: Math.ceil(totalProfiles / limit),
      totalProfiles,
      profiles,
    });
  } catch (error) {
    res.status(500).json({
      error,
      status: false,
      message: "Error occurred while fetching profiles",
    });
  }
};

export const searchProfiles = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      religion,
      caste,
      sub_caste,
      minAge,
      maxAge,
      marital_status,
      residing_country,
      residing_state,
      residing_city,
      sex,
      education,
      occupation,
      working_with,
      professional_area,
      eating_habit,
      smoking,
      drinking,
      body_type,
      complexion,
      height_min,
      height_max,
      blood_group,
      family_type,
      family_value,
      star,
      raashi,
      manglik,
      page = 1,
      limit = 10,
      searchText,
    } = req.query;

    const query = {};

    // Apply age filter only if explicitly passed
    if (minAge !== undefined || maxAge !== undefined) {
      const currentYear = new Date().getFullYear();
      const minB = currentYear - parseInt(maxAge ?? 60);
      const maxB = currentYear - parseInt(minAge ?? 18);
      query.dob = {
        $gte: new Date(`${minB}-01-01`),
        $lte: new Date(`${maxB}-12-31`),
      };
    }

    // Basic filters
    if (first_name) query.first_name = { $regex: first_name, $options: "i" };
    if (last_name) query.last_name = { $regex: last_name, $options: "i" };
    if (religion) query.religion = { $regex: religion, $options: "i" };
    if (caste) query.caste = { $regex: caste, $options: "i" };
    if (sub_caste) query.sub_caste = { $regex: sub_caste, $options: "i" };
    if (marital_status) query.marital_status = marital_status;
    if (residing_country)
      query.residing_country = { $regex: residing_country, $options: "i" };
    if (residing_state)
      query.residing_state = { $regex: residing_state, $options: "i" };
    if (residing_city)
      query.residing_city = { $regex: residing_city, $options: "i" };
    if (sex) query.sex = sex;

    // Education & Career
    if (education) query.education = { $regex: education, $options: "i" };
    if (occupation) query.occupation = { $regex: occupation, $options: "i" };
    if (working_with)
      query.working_with = { $regex: working_with, $options: "i" };
    if (professional_area)
      query.professional_area = { $regex: professional_area, $options: "i" };

    // Lifestyle & Physical
    if (eating_habit) query.eating_habit = eating_habit;
    if (smoking) query.smoking = smoking;
    if (drinking) query.drinking = drinking;
    if (body_type) query.body_type = body_type;
    if (complexion) query.complexion = complexion;
    if (blood_group) query.blood_group = blood_group;

    // Height range
    if (height_min || height_max) {
      query.height = {};
      if (height_min) query.height.$gte = height_min;
      if (height_max) query.height.$lte = height_max;
    }

    // Family & Astrological
    if (family_type) query.family_type = family_type;
    if (family_value) query.family_value = family_value;
    if (star) query.star = { $regex: star, $options: "i" };
    if (raashi) query.raashi = { $regex: raashi, $options: "i" };
    if (manglik) query.manglik = manglik;

    // General text search
    if (searchText) {
      query.$or = [
        { first_name: { $regex: searchText, $options: "i" } },
        { last_name: { $regex: searchText, $options: "i" } },
        { email: { $regex: searchText, $options: "i" } },
        { residing_city: { $regex: searchText, $options: "i" } },
        { residing_state: { $regex: searchText, $options: "i" } },
        { education: { $regex: searchText, $options: "i" } },
        { occupation: { $regex: searchText, $options: "i" } },
        { working_with: { $regex: searchText, $options: "i" } },
      ];
    }

    // Execute
    const [profiles, total] = await Promise.all([
      Profile.find(query)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .sort({ createdAt: -1 })
        .lean(),
      Profile.countDocuments(query),
    ]);

    const sanitized = profiles.map(
      ({ __v, updatedAt, password, ...rest }) => rest
    );

    return res.status(200).json({
      status: true,
      count: sanitized.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      profiles: sanitized,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Server error while searching profiles",
      error: err.message,
    });
  }
};

export const getAcceptedChatProfiles = async (req, res) => {
  try {
    const currentProfileId = req.user?.profile_id;

    if (!currentProfileId) {
      return res
        .status(400)
        .json({ status: false, message: "Missing profile ID" });
    }

    // Step 1: Find all interests sent by the user where status is "A"
    const interestsSent = await Interested.find({
      interest_from_pid: currentProfileId,
      interest_status: "A",
    });

    // Extract all the profile_ids the user has accepted
    const sentToProfileIds = interestsSent.map((i) => i.interested_in_pid);

    // Step 2: Check for mutual acceptance — those who also accepted back
    const mutualInterests = await Interested.find({
      interest_from_pid: { $in: sentToProfileIds },
      interested_in_pid: currentProfileId,
      interest_status: "A",
    });

    // Extract the mutually accepted profile ids
    const mutualProfileIds = mutualInterests.map((i) => i.interest_from_pid);

    // Step 3: Fetch profile details
    const profiles = await Profile.find({
      profile_id: { $in: mutualProfileIds },
    });

    return res.status(200).json({
      status: true,
      message: "Mutually accepted chat profiles fetched successfully",
      profiles,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error while fetching mutual accepted profiles",
      error: error.message,
    });
  }
};

export const deleteProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }
  try {
    const { profileId } = req.params;

    const profile = await Profile.findById(profileId);
    if (!profile) {
      return res.status(404).json({
        status: false,
        message: "Profile not found",
      });
    }

    // 🧹 Delete photos
    const photos = profile.photos || [];
    for (const photoPath of photos) {
      const safePhotoPath = path.normalize(photoPath);
      const fullPath = path.resolve(process.cwd(), "." + safePhotoPath);

      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.warn("Could not delete photo:", fullPath, err.message);
      }
    }

    // ❌ Delete profile from DB
    await Profile.deleteOne({ _id: profileId });

    return res.status(200).json({
      status: true,
      message: "Profile deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Server error while deleting profile",
      error: err.message,
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      maleCount,
      femaleCount,
      newSignups,
      recentUpdates,
    ] = await Promise.all([
      Profile.countDocuments(),
      Profile.countDocuments({ status: "active" }),
      Profile.countDocuments({ sex: "M" }),
      Profile.countDocuments({ sex: "F" }),
      Profile.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }),
      Profile.find({})
        .sort({ updated_timestamp: -1 })
        .limit(5)
        .select("first_name last_name created_for residing_country")
        .lean(),
    ]);

    res.json({
      totalUsers,
      activeUsers,
      maleCount,
      femaleCount,
      newSignups,
      recentUpdates,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching stats",
      error: err.message,
    });
  }
};
