import mongoose from "mongoose";

const creatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    avatar: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    followersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

creatorSchema.index({ name: "text", bio: "text" });

export const Creator = mongoose.model("Creator", creatorSchema);
