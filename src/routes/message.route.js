import express from "express";
import {
  createMessage,
  getMessagesBetweenUsers,
  getConversationMessages,
  updateMessage,
  deleteMessage
} from "../controllers/message.controller.js";

const router = express.Router();

// Send a new message
router.post("/", createMessage);

// Get messages between two users
router.get("/:user1/:user2", getMessagesBetweenUsers);

// Optional: if you're using auth middleware, this route can depend on req.user
router.get("/conversation/:conversationId", getConversationMessages);

// Update a message
router.put("/:id", updateMessage);

// Delete a message
router.delete("/:id", deleteMessage);

export default router;
