import express from "express";
import { getDashboardStats } from "../controllers/dashboardController";
import { authenticateToken   } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", /*authenticateToken,*/ getDashboardStats); // Fetch Dashboard Data

export default router;
