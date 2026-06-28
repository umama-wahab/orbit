import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    alias: { type: String, required: true },
    aliasColor: { type: String, required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const circleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      default: "",
      maxlength: 200,
    },
    inviteCode: {
      type: String,
      required: true,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [memberSchema],
    isTemporary: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Note: inviteCode already gets a unique index from `unique: true` above —
// no need to declare it again here, that was creating the duplicate-index
// warning Mongoose logs on startup.
// Note: expiry is handled by an application-level job (src/jobs/circleExpiry.js)
// rather than a MongoDB TTL index, so messages can be archived before the
// circle is marked inactive instead of being silently deleted.
circleSchema.index({ isTemporary: 1, isActive: 1, expiresAt: 1 });

export default mongoose.model("Circle", circleSchema);