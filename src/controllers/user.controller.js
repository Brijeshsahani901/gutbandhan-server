import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";


export const getOne = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: true,
      user,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Server errors",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;         // current page number
    const limit = parseInt(req.query.limit) || 10;      // items per page
    const skip = (page - 1) * limit;                    // how many records to skip

    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ timestamp_added: -1 }); // latest users first

    const totalUsers = await User.countDocuments();

    res.status(200).json({
      status: true,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
      users,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error occurred while fetching users",
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search filters from query parameters
    const { 
      name, 
      email, 
      username, 
      phone, 
      role, 
      status,
      dateFrom,
      dateTo,
      searchText // General search across multiple fields
    } = req.query;

    // Build the filter object
    const filter = {};
    
    // Exact match filters
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (username) filter.username = { $regex: username, $options: 'i' };
    if (phone) filter.phone = { $regex: phone, $options: 'i' };
    if (role && ['A', 'U', 'P'].includes(role)) filter.role = role;
    if (status && ['A', 'I'].includes(status)) filter.status = status;
    
    // Date range filter
    if (dateFrom || dateTo) {
      filter.timestamp_added = {};
      if (dateFrom) filter.timestamp_added.$gte = new Date(dateFrom);
      if (dateTo) filter.timestamp_added.$lte = new Date(dateTo);
    }
    
    // General text search across name, email, username
    if (searchText) {
      filter.$or = [
        { name: { $regex: searchText, $options: 'i' } },
        { email: { $regex: searchText, $options: 'i' } },
        { username: { $regex: searchText, $options: 'i' } },
        { phone: { $regex: searchText, $options: 'i' } }
      ];
    } else if (name) {
      // Name-only search if no general search text provided
      filter.name = { $regex: name, $options: 'i' };
    }
    // Execute query with pagination
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ timestamp_added: -1 }),
      User.countDocuments(filter)
    ]);

    res.status(200).json({
      status: true,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalUsers: total,
      users,
      filters: { // Return applied filters for reference
        name,
        email,
        username,
        phone,
        role,
        status,
        dateFrom,
        dateTo,
        searchText
      }
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error occurred while searching users",
      error: err.message
    });
  }
};

export const updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const { name, phone, email, username, password, status ,profile_id,profile_created } = req.body;
    const userId =  req.params.id;

    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({
        status: false,
        message: "User not found",
      });

    // Update fields that are allowed to be updated
    if (name) user.name = name;
    if (phone) user.phone = phone;
if (profile_id) user.profile_id = profile_id;
if (profile_created !== undefined) user.profile_created = profile_created;



    // Handle email update with uniqueness check
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          status: false,
          message: "Email already in use",
        });
      }
      user.email = email;
    }

    // Handle username update with uniqueness check
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({
          status: false,
          message: "Username already in use",
        });
      }
      user.username = username;
    }

    // Handle password update (will be hashed by pre-save hook)
    if (password) user.password = password;

    // Only allow status update if the requester has proper privileges
    // You might want to add role checking here
    if (status && ["A", "I"].includes(status)) {
      user.status = status;
    }

    await user.save();

    // Return updated user without password
    const userObj = user.toObject();
    delete userObj.password;


    res.status(200).json({
      status: true,
      message: "User updated successfully",
      user: userObj,
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error occurred while updating user",
      error: err.message,
    });
  }
};