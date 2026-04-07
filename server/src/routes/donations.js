import { Router } from "express";
import mongoose from "mongoose";
import { Donation } from "../models/Donation.js";

const donationsRouter = Router();

donationsRouter.get("/:creatorId", async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ message: "Invalid creator id" });
    }

    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(req.query.limit ?? "20", 10) || 20)
    );

    const donations = await Donation.find({ creatorId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json(donations);
  } catch (error) {
    next(error);
  }
});

export { donationsRouter };
