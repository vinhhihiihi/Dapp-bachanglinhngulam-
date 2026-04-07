import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";
import { Creator } from "./models/Creator.js";
import { defaultCreators } from "./data/defaultCreators.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

dotenv.config({ path: path.resolve(currentDir, "../.env") });
dotenv.config();

const port = Number.parseInt(process.env.PORT ?? "4000", 10);

async function seedIfEmpty() {
  const count = await Creator.countDocuments();
  if (count > 0) return;

  for (const creator of defaultCreators) {
    await Creator.findOneAndUpdate(
      { walletAddress: creator.walletAddress.toLowerCase() },
      creator,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

async function bootstrapMemoryMode() {
  const memoryServer = await MongoMemoryServer.create({
    instance: { dbName: "buy-me-a-coffee-dev" },
  });
  process.env.MONGODB_URI = memoryServer.getUri();

  await connectDB();
  await seedIfEmpty();

  const server = app.listen(port, () => {
    console.log(`API server (memory DB) running on http://localhost:${port}`);
  });

  async function shutdown() {
    server.close();
    await mongoose.disconnect();
    await memoryServer.stop();
    process.exit(0);
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

bootstrapMemoryMode().catch((error) => {
  console.error("Failed to start memory server:", error);
  process.exit(1);
});
