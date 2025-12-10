import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGO_URI!, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connected for tests");
    isConnected = true;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};
