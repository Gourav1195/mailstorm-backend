// routes/health.js
import express from "express";
import { healthCheck } from "../controllers/healthController";
const router = express.Router();

router.get("/ping-db", healthCheck);

export default router;
