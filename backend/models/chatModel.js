const mongoose = require("mongoose");
chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    paidMonthly: { type: Date },
    oneChatOnly: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
const Chat = mongoose.model("Chat", chatModel);
module.exports = Chat;
