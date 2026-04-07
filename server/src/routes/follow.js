import { Router } from "express";
import mongoose from "mongoose";
import { Creator } from "../models/Creator.js";
import { Follow } from "../models/Follow.js";

const followRouter = Router();

function parseFollowerAddress(req) {
  const fromBody = req.body?.followerAddress;
  const fromQuery = req.query?.followerAddress;
  const value = (fromBody || fromQuery || "").toString().trim().toLowerCase();
  return value;
}

followRouter.get("/:creatorId", async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ message: "Invalid creator id" });
    }

    const followerAddress = parseFollowerAddress(req);
    if (!followerAddress) {
      return res.status(200).json({ isFollowing: false });
    }

    const follow = await Follow.findOne({ creatorId, followerAddress }).lean();
    res.json({ isFollowing: Boolean(follow) });
  } catch (error) {
    next(error);
  }
});

followRouter.post("/:creatorId", async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ message: "Invalid creator id" });
    }

    const followerAddress = parseFollowerAddress(req);
    if (!followerAddress) {
      return res.status(400).json({ message: "followerAddress is required" });
    }

    const creator = await Creator.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const existingFollow = await Follow.findOne({ creatorId, followerAddress });
    if (existingFollow) {
      return res.json({
        isFollowing: true,
        followersCount: creator.followersCount,
      });
    }

    await Follow.create({ creatorId, followerAddress });
    creator.followersCount += 1;
    await creator.save();

    res.status(201).json({
      isFollowing: true,
      followersCount: creator.followersCount,
    });
  } catch (error) {
    if (error?.code === 11000) {
      const creator = await Creator.findById(req.params.creatorId).lean();
      return res.json({
        isFollowing: true,
        followersCount: creator?.followersCount ?? 0,
      });
    }

    next(error);
  }
});

followRouter.delete("/:creatorId", async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ message: "Invalid creator id" });
    }

    const followerAddress = parseFollowerAddress(req);
    if (!followerAddress) {
      return res.status(400).json({ message: "followerAddress is required" });
    }

    const creator = await Creator.findById(creatorId);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const result = await Follow.findOneAndDelete({ creatorId, followerAddress });
    if (result) {
      creator.followersCount = Math.max(0, creator.followersCount - 1);
      await creator.save();
    }

    res.json({
      isFollowing: false,
      followersCount: creator.followersCount,
    });
  } catch (error) {
    next(error);
  }
});

export { followRouter };
