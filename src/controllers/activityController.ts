import { Request, Response } from "express";
import ActivityLog from "../models/ActivityLog";

export const getActivityLogs = async (req: Request, res: Response) => {
  try {
    const logs = await ActivityLog.find().populate("user", "email firstName lastName").sort({ timestamp: -1 });
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching activity logs", error });
  }
};
