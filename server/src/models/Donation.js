import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creator",
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: "Anonymous",
      trim: true,
      maxlength: 120,
    },
    walletAddress: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    txHash: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export const Donation = mongoose.model("Donation", donationSchema);
