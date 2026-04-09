import { Router } from "express";
import {
  authenticateAdminCredentials,
  getAdminAuthConfigForClient,
  issueAdminToken,
  requireAdminAuth,
} from "../auth/adminAuth.js";

const adminRouter = Router();

adminRouter.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "username and password are required" });
  }

  const isValid = authenticateAdminCredentials(username, password);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const token = issueAdminToken();
  const config = getAdminAuthConfigForClient();
  return res.json({
    token,
    username: config.username,
    expiresInSeconds: config.expiresInSeconds,
  });
});

adminRouter.get("/session", requireAdminAuth, async (req, res) => {
  const config = getAdminAuthConfigForClient();
  res.json({
    ok: true,
    username: req.admin?.username || config.username,
  });
});

export { adminRouter };
