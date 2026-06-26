import mongoose from "mongoose";

const confessionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    category: {
      type: String,
      enum: ["College", "Gaming", "Relationships", "Work", "Random Thoughts", "Funny Stories"],
      required: true,
    },
    // Stored for moderation/report resolution; never exposed to other users
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    reportedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isHidden: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

confessionSchema.index({ category: 1, createdAt: -1 });
confessionSchema.index({ likes: 1 });

export default mongoose.model("Confession", confessionSchema);
