import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    confession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Confession",
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

commentSchema.index({ confession: 1, createdAt: 1 });

export default mongoose.model("Comment", commentSchema);
