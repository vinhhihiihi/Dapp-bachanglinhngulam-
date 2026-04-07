import cors from "cors";
import express from "express";
import morgan from "morgan";
import { creatorsRouter } from "./routes/creators.js";
import { donateRouter } from "./routes/donate.js";
import { donationsRouter } from "./routes/donations.js";
import { followRouter } from "./routes/follow.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((item) => item.trim()) || "*",
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/creators", creatorsRouter);
app.use("/api/follow", followRouter);
app.use("/api/donate", donateRouter);
app.use("/api/donations", donationsRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: error?.message || "Internal server error" });
});

export { app };
