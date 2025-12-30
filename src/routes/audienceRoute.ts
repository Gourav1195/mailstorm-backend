import express from "express";
import { getAudience, getAudienceCount, estimatedAudience } from "../controllers/audienceController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", /*authenticateToken,*/ getAudience); 
router.get("/count", /*authenticateToken,*/ getAudienceCount); 
router.get("/estimate", /*authenticateToken,*/ estimatedAudience); 
export default router;
