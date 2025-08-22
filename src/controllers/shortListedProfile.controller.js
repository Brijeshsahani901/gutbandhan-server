import ShortlistedProfile from "../models/shortListedProfile.model.js";
import { validationResult } from "express-validator";
import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";

export const shortlistProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }
  try {
    const { shortlisted_by_pid, shortlisted_pid } = req.body;

    // Validate input
    if (!shortlisted_by_pid || !shortlisted_pid) {
      return res.status(400).json({
        status: false,
        message: "Both 'shortlisted_by_pid' and 'shortlisted_pid' are required",
      });
    }

    // Check if profile is already shortlisted
    const alreadyShortlisted = await ShortlistedProfile.findOne({
      shortlisted_by_pid,
      shortlisted_pid,
    });

    if (alreadyShortlisted) {
      return res.status(409).json({
        status: false,
        message: "Profile is already shortlisted",
      });
    }

    // Proceed to save new shortlist entry
    const shortlist = new ShortlistedProfile({
      shortlisted_by_pid,
      shortlisted_pid,
    });

    await shortlist.save();

    return res.status(201).json({
      status: true,
      message: "Profile shortlisted successfully",
      data: shortlist,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error shortlisting profile",
      error: err.message,
    });
  }
};

// export const getAllShortlistedProfiles = async (req, res) => {
//   try {
//     // Pagination parameters
//     const { page = 1, limit = 20 } = req.query;
//     const pageNumber = parseInt(page);
//     const limitNumber = parseInt(limit);
//     const skip = (pageNumber - 1) * limitNumber;

//     // Optional filters
//     const filter = {};
//     if (req.query.shortlisted_by_pid) filter.shortlisted_by_pid = req.query.shortlisted_by_pid;
//     if (req.query.shortlisted_pid) filter.shortlisted_pid = req.query.shortlisted_pid;

//     // Get data with pagination
//     const [shortlisted, total] = await Promise.all([
//       ShortlistedProfile.find(filter)
//         .sort({ shortlisted_timestamp: -1 })
//         .skip(skip)
//         .limit(limitNumber)
//         .lean(),
//       ShortlistedProfile.countDocuments(filter)
//     ]);

//     // Calculate total pages
//     const totalPages = Math.ceil(total / limitNumber);

//     return res.status(200).json({
//       status: true,
//       count: shortlisted.length,
//       total,
//       totalPages,
//       currentPage: pageNumber,
//       itemsPerPage: limitNumber,
//       data: shortlisted
//     });
//   } catch (err) {
//     return res.status(500).json({
//       status: false,
//       message: "Error fetching all shortlisted profiles",
//       error: err.message
//     });
//   }
// };

export const getAllShortlistedProfiles = async (req, res) => {
  try {
    // Pagination parameters
    const { page = 1, limit = 20 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Optional filters
    const filter = {};
    if (req.query.shortlisted_by_pid)
      filter.shortlisted_by_pid = req.query.shortlisted_by_pid;
    if (req.query.shortlisted_pid)
      filter.shortlisted_pid = req.query.shortlisted_pid;

    // Get shortlist entries
    const [shortlisted, total] = await Promise.all([
      ShortlistedProfile.find(filter)
        .sort({ shortlisted_timestamp: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      ShortlistedProfile.countDocuments(filter),
    ]);

    // Get related profiles (only once)
    const profileIds = shortlisted.map((item) => item.shortlisted_pid);
    const profiles = await Profile.find({ profile_id: { $in: profileIds } })
      .select("profile_id name age location photos hobby about ")
      .lean();

    // Map profiles by profile_id
    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.profile_id] = profile;
      return acc;
    }, {});

    // Attach profile data to each shortlist item
    const enrichedShortlisted = shortlisted.map((item) => ({
      ...item,
      profile: profileMap[item.shortlisted_pid] || null,
    }));

    const totalPages = Math.ceil(total / limitNumber);

    return res.status(200).json({
      status: true,
      count: enrichedShortlisted.length,
      total,
      totalPages,
      currentPage: pageNumber,
      itemsPerPage: limitNumber,
      data: enrichedShortlisted,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Error fetching shortlisted profiles",
      error: err.message,
    });
  }
};

export const getShortlistedProfiles = async (req, res) => {
  try {
    const { pid } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get shortlisted profiles with pagination
    const [shortlisted, total] = await Promise.all([
      ShortlistedProfile.find({ shortlisted_by_pid: pid })
        .sort({ shortlisted_timestamp: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      ShortlistedProfile.countDocuments({ shortlisted_by_pid: pid }),
    ]);

    // Get profile details for each shortlisted profile
    const profileIds = shortlisted.map((s) => s.shortlisted_pid);
    const profiles = await Profile.find({
      profile_id: { $in: profileIds },
    }).select("profile_id full_name photos residing_city"); // Only select needed fields

    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.profile_id] = profile;
      return acc;
    }, {});

    // Combine shortlist data with profile info
    const populatedShortlists = shortlisted.map((item) => ({
      ...item,
      profile: profileMap[item.shortlisted_pid] || null,
    }));

    const totalPages = Math.ceil(total / limitNumber);

    res.status(200).json({
      status: true,
      count: populatedShortlists.length,
      total,
      totalPages,
      currentPage: pageNumber,
      itemsPerPage: limitNumber,
      data: populatedShortlists,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error fetching shortlisted profiles",
      error: err.message,
    });
  }
};

export const removeShortlistedProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      errors: errors.array(),
    });
  }
  try {
    const { shortlisted_by_pid, shortlisted_pid } = req.body;

    const result = await ShortlistedProfile.findOneAndDelete({
      shortlisted_by_pid,
      shortlisted_pid,
    });

    if (!result) {
      return res.status(404).json({
        status: false,
        message: "Shortlisted profile not found",
      });
    }

    res.status(200).json({
      status: true,
      message: "Shortlisted profile removed successfully",
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error removing shortlisted profile",
      error: err.message,
    });
  }
};

export const getAllShortlistedProfilesByMe = async (req, res) => {
  try {
   const profileId = req.query.profile_id; // ✅ Correct way

    // console.log(userId);
    // // Step 1: Get user's profile_id
    // const user = await User.findById(userId).select("profile_id");
    // console.log(user)
    // if (!user || !user.profile_id) {
    //   return res.status(404).json({
    //     status: false,
    //     message: "User profile_id not found",
    //   });
    // }


    // const profileId = user.profile_id;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Step 2: Find all entries where user has shortlisted someone
    const shortlistedEntries = await ShortlistedProfile.find({
      shortlisted_by_pid: profileId,
    })
      .sort({ shortlisted_timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ShortlistedProfile.countDocuments({
      shortlisted_by_pid: profileId,
    });

    // Step 3: Extract profile_ids that were shortlisted
    const shortlistedProfileIds = shortlistedEntries.map(
      (entry) => entry.shortlisted_pid
    );

    // Step 4: Fetch those profiles from Profile model
    const profiles = await Profile.find({
      profile_id: { $in: shortlistedProfileIds },
    });

    // Step 5: Sanitize the output
    const sanitizedProfiles = profiles.map((profile) => {
      const { __v, updatedAt, password, ...rest } = profile.toObject();
      return rest;
    });

    return res.status(200).json({
      status: true,
      total,
      count: sanitizedProfiles.length,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      profiles: sanitizedProfiles,
    });
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: "Server error while fetching shortlisted profiles",
      error: err.message,
    });
  }
};
