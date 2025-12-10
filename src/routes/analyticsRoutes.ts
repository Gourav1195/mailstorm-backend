import express from "express";
import { trackPerformance, getCampaignPerformance, getAnalyticsReport } from "../controllers/analyticsController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/track", authenticateToken, trackPerformance);                 // Track performance metrics
router.get("/performance/:campaignId", authenticateToken, getCampaignPerformance); // Get campaign performance
router.get("/report", authenticateToken, getAnalyticsReport);              // Get analytics report

export default router;
