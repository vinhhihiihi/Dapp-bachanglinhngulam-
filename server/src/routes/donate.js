import { Router } from "express";
import mongoose from "mongoose";
import { Creator } from "../models/Creator.js";
import { Donation } from "../models/Donation.js";

const donateRouter = Router();

donateRouter.post("/", async (req, res, next) => {
  try {
    const { creatorId, name, walletAddress, message, amount, txHash } = req.body;

    if (!creatorId || !walletAddress || amount === undefined) {
      return res
        .status(400)
        .json({ message: "creatorId, walletAddress and amount are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ message: "Invalid creator id" });
    }

    const creator = await Creator.findById(creatorId).lean();
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "amount must be a positive number" });
    }

    const donation = await Donation.create({
      creatorId,
      name,
      walletAddress,
      message,
      amount: numericAmount,
      txHash,
    });

    res.status(201).json(donation);
  } catch (error) {
    next(error);
  }
});

export { donateRouter };
