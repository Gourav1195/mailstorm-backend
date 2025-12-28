/*import express from "express";
import { createCampaign, getCampaigns, updateCampaign, deleteCampaign  } from "../controllers/campaignController";
import { authenticateToken } from "../middleware/authMiddleware";


const router = express.Router();

router.post("/", authenticateToken, createCampaign);
router.get("/", authenticateToken, getCampaigns);
router.put("/:id", authenticateToken, updateCampaign);
router.delete("/:id", authenticateToken, deleteCampaign);
// router.post("/trigger", authenticateToken, triggerCampaign);

export default router; */

import express from "express";
import { getCampaigns, getCampaignById, createOrUpdateCampaign, createCampaign, toggleCampaignStatus, duplicateCampaign,  launchCampaign, deleteCampaign } from "../controllers/campaignController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

// router.get("/campaigns", /*authenticateToken,*/ getCampaignList); // ✅ Get Campaign List
router.post("/", /*authenticateToken,*/ createCampaign); // Create/Update Campaign
router.get("/", /*authenticateToken,*/  getCampaigns); // Get All Campaigns
router.put("/:campaignId/launch", /*authenticateToken,*/ launchCampaign); // Launch Campaign
router.delete("/:campaignId", /*authenticateToken,*/  deleteCampaign); // Delete Campaign
router.put("/:campaignId/edit", /*authenticateToken,*/ createOrUpdateCampaign); // ✅ Edit Campaign
router.get("/:campaignId", /*authenticateToken,*/ getCampaignById); // ✅ Get Campaign By ID
router.put("/:campaignId/pause-resume", /*authenticateToken,*/ toggleCampaignStatus); // ✅ Pause/Resume Campaign
router.post("/:campaignId/duplicate", /*authenticateToken,*/ duplicateCampaign); // ✅ Duplicate Campaign

export default router;


