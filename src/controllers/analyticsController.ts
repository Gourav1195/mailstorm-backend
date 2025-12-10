import { Request, Response } from "express";
import CampaignPerformance from "../models/CampaignPerformance";
import Campaign from "../models/Campaign";

// 1️⃣ Track Performance Metrics
export const trackPerformance = async (req: Request, res: Response) => {
  try {
    const { campaignId, emailsSent, openRate, clickRate, conversionRate } = req.body;

    const performance = new CampaignPerformance({
      campaignId,
      emailsSent,
      openRate,
      clickRate,
      conversionRate
    });

    await performance.save();
    res.status(201).json(performance);
  } catch (error) {
    res.status(500).json({ message: "Error tracking performance", error });
  }
};

// 2️⃣ Get Campaign Performance by ID
export const getCampaignPerformance = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;
    const performance = await CampaignPerformance.find({ campaignId }).sort({ timestamp: -1 });

    if (!performance.length) return res.status(404).json({ message: "No performance data found" });
    res.status(200).json(performance);
  } catch (error) {
    res.status(500).json({ message: "Error fetching performance", error });
  }
};

// 3️⃣ Generate Analytics Report
export const getAnalyticsReport = async (req: Request, res: Response) => {
  try {
    const { range } = req.query; // daily, weekly, monthly

    const matchStage = {};
    const groupStage = {
      _id: "$campaignId",
      totalEmailsSent: { $sum: "$emailsSent" },
      averageOpenRate: { $avg: "$openRate" },
      averageClickRate: { $avg: "$clickRate" },
      averageConversionRate: { $avg: "$conversionRate" }
    };

    const report = await CampaignPerformance.aggregate([
      { $match: matchStage },
      { $group: groupStage },
      { $lookup: { from: "campaigns", localField: "_id", foreignField: "_id", as: "campaign" } }
    ]);

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ message: "Error generating report", error });
  }
};
