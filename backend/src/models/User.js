import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 24,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 160,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    avatarColor: {
      type: String,
      default: function () {
        const colors = [
          "#F07B3F",
          "#307092",
          "#E5BE4D",
          "#8D47F5",
          "#D84F83",
          "#A9C5A0",
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      },
    },
    theme: {
      type: String,
      enum: ["social", "focus", "shadow"],
      default: "social",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    joinedCircles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Circle",
      },
    ],
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    avatarColor: this.avatarColor,
    theme: this.theme,
    isOnline: this.isOnline,
    lastSeen: this.lastSeen,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);
