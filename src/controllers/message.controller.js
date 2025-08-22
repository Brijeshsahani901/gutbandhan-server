import Message from "../models/message.model.js";
import Profile from "../models/profile.model.js";

// 🔹 Validate profile IDs
const validateProfiles = async (senderId, receiverId) => {
  const sender = await Profile.findOne({ profile_id: senderId });
  const receiver = await Profile.findOne({ profile_id: receiverId });
  if (!sender || !receiver) {
    throw new Error("Sender or Receiver profile_id does not exist");
  }
};

// 🔹 Create a message
export const createMessage = async (req, res) => {
  try {
    const { sender_profile_id, receiver_profile_id, text } = req.body;

    await validateProfiles(sender_profile_id, receiver_profile_id);

    const message = await Message.create({
      sender_profile_id,
      receiver_profile_id,
      text,
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🔹 Get messages between two profile_ids
export const getMessagesBetweenUsers = async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    await validateProfiles(user1, user2);

    const messages = await Message.find({
      $or: [
        { sender_profile_id: user1, receiver_profile_id: user2 },
        { sender_profile_id: user2, receiver_profile_id: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🔹 Get messages for a conversation (auth user with another)
export const getConversationMessages = async (req, res) => {
  const { conversationId } = req.params;
  const { profile_id: currentProfileId } = req.user; 

  try {
    await validateProfiles(currentProfileId, conversationId);

    const messages = await Message.find({
      $or: [
        { sender_profile_id: currentProfileId, receiver_profile_id: conversationId },
        { sender_profile_id: conversationId, receiver_profile_id: currentProfileId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🔹 Update a message
export const updateMessage = async (req, res) => {
  try {
    const updated = await Message.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
