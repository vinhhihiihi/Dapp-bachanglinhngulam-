import mongoose from "mongoose";

export async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI in environment variables");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
}
