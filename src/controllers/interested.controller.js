import Interested from "../models/interested.model.js";
import Profile from "../models/profile.model.js";
import { validationResult } from "express-validator";

export const expressInterest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }
  try {
    const { interest_from_pid, interested_in_pid, interest_msg } = req.body;

    // Check if both profiles exist using profile_id
    const [fromProfile, toProfile] = await Promise.all([
      Profile.findOne({ profile_id: interest_from_pid }),
      Profile.findOne({ profile_id: interested_in_pid }),
    ]);

    if (!fromProfile || !toProfile)
      return res.status(404).json({
        status: false,
        message: "One or both profiles not found",
      });

    // Prevent self-interest
    if (interest_from_pid == interested_in_pid)
      return res.status(400).json({
        status: false,
        message: "Cannot express interest in your own profile",
      });

    // Check if active interest already exists (status "P" or "A")
    const existingActiveInterest = await Interested.findOne({
      interest_from_pid,
      interested_in_pid,
      interest_status: { $in: ["P", "A"] }, // Check for either status
    });

    if (existingActiveInterest) {
      return res.status(409).json({
        status: false,
        message: "Active interest already exists (Pending or Accepted)",
        data: existingActiveInterest,
      });
    }

    // Check if any interest exists (regardless of status)
    const anyExistingInterest = await Interested.findOne({
      interest_from_pid,
      interested_in_pid,
    });

    if (anyExistingInterest) {
      // Update existing interest (if you want to allow reviving rejected/expired interests)
      anyExistingInterest.interest_status = "P";
      anyExistingInterest.interest_msg = interest_msg;
      anyExistingInterest.response_msg = "";
      anyExistingInterest.updatedAt = new Date();

      const updatedInterest = await anyExistingInterest.save();

      return res.status(200).json({
        status: true,
        message: "Existing interest updated to Pending",
        data: updatedInterest,
      });
    }

    // Create new interest if none exists
    const interest = new Interested({
      interest_from_pid,
      interested_in_pid,
      interest_msg,
      response_msg: "",
      interest_status: "P",
    });

    await interest.save();

    return res.status(201).json({
      status: true,
      message: "Interest expressed successfully",
      data: interest,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error expressing interest",
      error: err.message,
    });
  }
};

export const getAllInterests = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }

  try {
    const { status, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Build query
    const query = {};
    if (status && ["A", "D", "P"].includes(status)) {
      query.interest_status = status;
    }

    // Fetch interests with pagination
    const [interests, total] = await Promise.all([
      Interested.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Interested.countDocuments(query),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limitNumber);

    // Collect all profile IDs (senders and receivers) to fetch profiles in one go
    const profileIdsSet = new Set();
    interests.forEach((interest) => {
      profileIdsSet.add(interest.interest_from_pid);
      profileIdsSet.add(interest.interested_in_pid);
    });

    const profileIds = Array.from(profileIdsSet);

    // Fetch profiles
    const profiles = await Profile.find({ profile_id: { $in: profileIds } });

    // Map profile_id to profile details
    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.profile_id] = {
        full_name: profile.full_name,
        residing_city: profile.residing_city,
        photos: profile.photos,
      };
      return acc;
    }, {});

    // Populate interests with both from_profile and to_profile
    const populatedInterests = interests.map((interest) => ({
      ...interest,
      from_profile: profileMap[interest.interest_from_pid] || null,
      to_profile: profileMap[interest.interested_in_pid] || null,
    }));

    res.status(200).json({
      status: true,
      count: populatedInterests.length,
      total,
      totalPages,
      currentPage: pageNumber,
      itemsPerPage: limitNumber,
      data: populatedInterests,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error fetching all interests",
      error: err.message,
    });
  }
};

export const respondToInterest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }
  try {
    const { id } = req.params; // This is the interest record ID from interested table
    const { response_msg, interest_status, responding_profile_id } = req.body;

    // 1. Verify the interest record exists in the Interested collection
    const interest = await Interested.findById(id);
    if (!interest) {
      return res.status(404).json({
        status: false,
        message: "Interest record not found",
      });
    }

    // 2. Verify the responding user owns the profile being interested in
    // if (interest.interested_in_pid !== responding_profile_id) {
    //   return res.status(403).json({
    //     status: false,
    //     message:
    //       "Unauthorized - You can only respond to interests in your own profile",
    //   });
    // }

    // 3. Verify the profile exists (optional additional check)
    const profile = await Profile.findOne({
      profile_id: responding_profile_id,
    });
    if (!profile) {
      return res.status(404).json({
        status: false,
        message: "Profile not found",
      });
    }

    // 4. Update the interest record in the Interested collection
    interest.response_msg = response_msg;
    interest.interest_status = interest_status;
    await interest.save();

    return res.status(200).json({
      status: true,
      message: "Response submitted successfully",
      data: {
        id: interest._id,
        interest_from_pid: interest.interest_from_pid,
        interested_in_pid: interest.interested_in_pid,
        interest_msg: interest.interest_msg,
        response_msg: interest.response_msg,
        interest_status: interest.interest_status,
        updatedAt: interest.updatedAt,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error responding to interest",
      error: err.message,
    });
  }
};

export const getInterestsReceived = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }
  try {
    const { pid } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Verify profile exists
    const profile = await Profile.findOne({ profile_id: pid });
    if (!profile) {
      return res.status(404).json({
        status: false,
        message: "Profile not found",
      });
    }

    const query = { interested_in_pid: pid, interest_status: "P" };

    // Get interests with pagination
    const [interests, total] = await Promise.all([
      Interested.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Interested.countDocuments(query),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limitNumber);

    // Populate sender profiles in a single query
    const fromProfileIds = interests.map((i) => i.interest_from_pid);
    const fromProfiles = await Profile.find({
      profile_id: { $in: fromProfileIds },
    });

    const profileMap = fromProfiles.reduce((acc, profile) => {
      acc[profile.profile_id] = {
        full_name: profile.full_name,
        residing_city: profile.residing_city,
        photos: profile.photos,
      };
      return acc;
    }, {});

    const populatedInterests = interests.map((interest) => ({
      ...interest,
      from_profile: profileMap[interest.interest_from_pid] || null,
    }));

    res.status(200).json({
      status: true,
      count: populatedInterests.length,
      total,
      totalPages,
      currentPage: pageNumber,
      itemsPerPage: limitNumber,
      data: populatedInterests,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error fetching received interests",
      error: err.message,
    });
  }
};

export const getInterestsSent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }
  try {
    const { pid } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Verify profile exists
    const profile = await Profile.findOne({ profile_id: pid });
    if (!profile) {
      return res.status(404).json({
        status: false,
        message: "Profile not found",
      });
    }

    const query = { interest_from_pid: pid, interest_status: "P" };

    // Get interests with pagination
    const [interests, total] = await Promise.all([
      Interested.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      Interested.countDocuments(query),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(total / limitNumber);

    // Populate receiver profiles efficiently
    const toProfileIds = interests.map((i) => i.interested_in_pid);
    const toProfiles = await Profile.find({
      profile_id: { $in: toProfileIds },
    });

    const profileMap = toProfiles.reduce((acc, profile) => {
      acc[profile.profile_id] = {
        full_name: profile.full_name,
        residing_city: profile.residing_city,
        photos: profile.photos,
      };
      return acc;
    }, {});

    const populatedInterests = interests.map((interest) => ({
      ...interest,
      to_profile: profileMap[interest.interested_in_pid] || null,
    }));

    res.status(200).json({
      status: true,
      count: populatedInterests.length,
      total,
      totalPages,
      currentPage: pageNumber,
      itemsPerPage: limitNumber,
      data: populatedInterests,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error fetching sent interests",
      error: err.message,
    });
  }
};

export const removeInterest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }
  try {
    const { id } = req.params;
    const { requester_profile_id } = req.body;

    // Verify the interest exists and belongs to the requester
    const interest = await Interested.findOne({
      _id: id,
      interest_from_pid: requester_profile_id,
    });

    if (!interest) {
      return res.status(404).json({
        status: false,
        message: "Interest record not found or unauthorized",
      });
    }

    await Interested.findByIdAndDelete(id);

    res.status(200).json({
      status: true,
      message: "Interest removed successfully",
      deletedId: id,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error removing interest",
      error: err.message,
    });
  }
};

export const searchInterestByProfiles = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }

  try {
    const { interest_from_pid, interested_in_pid } = req.query;

    if (!interest_from_pid || !interested_in_pid) {
      return res.status(400).json({
        status: false,
        message: "Both interest_from_pid and interested_in_pid are required",
      });
    }

    const interest = await Interested.findOne({
      interest_from_pid,
      interested_in_pid,
    });

    if (!interest) {
      return res.status(200).json({
        status: true,
        message: "Interest not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: true,
      message: "Interest found",
      data: interest,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error searching interest by profiles",
      error: err.message,
    });
  }
};
