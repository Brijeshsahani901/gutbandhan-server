import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender_profile_id: {
      type: String,
      required: true,
    },
    receiver_profile_id: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageSchema);

export default Message;
