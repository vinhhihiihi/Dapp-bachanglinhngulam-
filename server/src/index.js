import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { app } from "./app.js";
import { connectDB } from "./config/db.js";

const currentFile = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFile);

dotenv.config({ path: path.resolve(currentDir, "../.env") });
dotenv.config();

const port = Number.parseInt(process.env.PORT ?? "4000", 10);

async function bootstrap() {
  await connectDB();
  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
