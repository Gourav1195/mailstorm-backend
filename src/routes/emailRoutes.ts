import express from "express";
import { getEmailReports } from "../controllers/emailReportController";

const router = express.Router();

// GET email reports with optional search, sorting, and pagination
router.get("/email-reports", getEmailReports);

export default router;
