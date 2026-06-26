import mongoose from "mongoose";

const circleReactionSchema = new mongoose.Schema(
  {
    alias: { type: String, required: true },
    emoji: { type: String, required: true },
  },
  { _id: false }
);

const circleMessageSchema = new mongoose.Schema(
  {
    circle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Circle",
      required: true,
    },
    senderAlias: {
      type: String,
      required: true,
    },
    senderAliasColor: {
      type: String,
      required: true,
    },
    // Kept server-side only for moderation; never sent to clients of other members
    senderUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    reactions: [circleReactionSchema],
    type: {
      type: String,
      enum: ["text", "poll", "system"],
      default: "text",
    },
    poll: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
    },
  },
  { timestamps: true }
);

circleMessageSchema.index({ circle: 1, createdAt: -1 });

export default mongoose.model("CircleMessage", circleMessageSchema);
