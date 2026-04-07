import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creator",
      required: true,
      index: true,
    },
    followerAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { timestamps: true }
);

followSchema.index({ creatorId: 1, followerAddress: 1 }, { unique: true });

export const Follow = mongoose.model("Follow", followSchema);
