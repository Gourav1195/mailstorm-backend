import { Request, Response } from "express";
import mongoose from "mongoose";

export const healthCheck = async (req: Request, res: Response) => {
  try {
    // lightweight no-op query
    await mongoose.connection.db.admin().ping();

    return res.status(200).json({
      status: "ok",
      db: "alive",
      time: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("DB ping failed:", err.message);
    return res.status(500).json({
      status: "fail",
      db: "sleeping like a cat",
    });
  }
}