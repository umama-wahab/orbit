import mongoose from "mongoose";

const pollOptionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, maxlength: 100 },
    votes: [
      {
        // Stores user id for groups, alias for circles (string comparison handled in controller)
        type: String,
      },
    ],
  },
  { _id: true }
);

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      maxlength: 200,
    },
    options: [pollOptionSchema],
    context: {
      type: String,
      enum: ["group", "circle"],
      required: true,
    },
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
    },
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circle",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isAnonymous: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Poll", pollSchema);
