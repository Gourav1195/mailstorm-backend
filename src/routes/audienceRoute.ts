import express from "express";
import { getAudience, getAudienceCount } from "../controllers/audienceController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", /*authenticateToken,*/ getAudience); 
router.get("/count", /*authenticateToken,*/ getAudienceCount); 
export default router;
