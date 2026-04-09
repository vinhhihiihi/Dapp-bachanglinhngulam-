import { Router } from "express";
import mongoose from "mongoose";
import { requireAdminAuth } from "../auth/adminAuth.js";
import { Creator } from "../models/Creator.js";
import { Donation } from "../models/Donation.js";
import { Follow } from "../models/Follow.js";
import { getPaginationParams } from "../utils/pagination.js";

const creatorsRouter = Router();

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

creatorsRouter.get("/", async (req, res, next) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const searchRaw = req.query.search?.trim() || "";
    const search = searchRaw ? escapeRegex(searchRaw) : "";
    const filter = search ? { name: { $regex: `^${search}`, $options: "i" } } : {};
    const sort = search
      ? { name: 1, followersCount: -1 }
      : { followersCount: -1, name: 1 };

    const [creators, total] = await Promise.all([
      Creator.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Creator.countDocuments(filter),
    ]);

    res.json({
      data: creators,
      meta: {
        page,
        limit,
        total,
        hasMore: skip + creators.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
});

creatorsRouter.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid creator id" });
    }

    const creator = await Creator.findById(req.params.id).lean();
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    res.json(creator);
  } catch (error) {
    next(error);
  }
});

creatorsRouter.post("/", requireAdminAuth, async (req, res, next) => {
  try {
    const { name, avatar, bio, walletAddress } = req.body;

    if (!name || !avatar || !walletAddress) {
      return res
        .status(400)
        .json({ message: "name, avatar and walletAddress are required" });
    }

    const creator = await Creator.create({
      name,
      avatar,
      bio,
      walletAddress,
    });

    res.status(201).json(creator);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "walletAddress already exists" });
    }

    next(error);
  }
});

creatorsRouter.patch("/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid creator id" });
    }

    const creator = await Creator.findById(id);
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    const { name, avatar, bio, walletAddress } = req.body || {};
    const hasUpdate =
      typeof name === "string" ||
      typeof avatar === "string" ||
      typeof bio === "string" ||
      typeof walletAddress === "string";

    if (!hasUpdate) {
      return res
        .status(400)
        .json({ message: "At least one of name, avatar, bio, walletAddress is required" });
    }

    if (typeof name === "string") {
      creator.name = name.trim();
    }

    if (typeof avatar === "string") {
      creator.avatar = avatar.trim();
    }

    if (typeof bio === "string") {
      creator.bio = bio.trim();
    }

    if (typeof walletAddress === "string") {
      creator.walletAddress = walletAddress.trim().toLowerCase();
    }

    if (!creator.name || !creator.avatar || !creator.walletAddress) {
      return res
        .status(400)
        .json({ message: "name, avatar and walletAddress are required" });
    }

    await creator.save();
    res.json(creator);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "walletAddress already exists" });
    }

    next(error);
  }
});

creatorsRouter.delete("/:id", requireAdminAuth, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid creator id" });
    }

    const creator = await Creator.findByIdAndDelete(id).lean();
    if (!creator) {
      return res.status(404).json({ message: "Creator not found" });
    }

    await Promise.all([
      Follow.deleteMany({ creatorId: id }),
      Donation.deleteMany({ creatorId: id }),
    ]);

    res.json({ message: "Creator deleted", creatorId: id });
  } catch (error) {
    next(error);
  }
});

export { creatorsRouter };
