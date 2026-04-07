import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB } from "./config/db.js";
import { defaultCreators } from "./data/defaultCreators.js";
import { Creator } from "./models/Creator.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

dotenv.config({ path: path.resolve(currentDir, "../.env") });
dotenv.config();

async function runSeed() {
  await connectDB();

  for (const creator of defaultCreators) {
    await Creator.findOneAndUpdate(
      { walletAddress: creator.walletAddress.toLowerCase() },
      creator,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log(`Seeded ${defaultCreators.length} creators`);
  process.exit(0);
}

runSeed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
