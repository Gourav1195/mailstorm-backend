import express from "express";
import { getActivityLogs } from "../controllers/activityController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authenticateToken, getActivityLogs);

export default router;
