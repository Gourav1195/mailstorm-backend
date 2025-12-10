/*import express from "express";
import { createFilter, getFilters, applyFilter } from "../controllers/filterController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", authenticateToken, createFilter);
router.get("/", authenticateToken, getFilters);
router.get("/apply/:filterId", authenticateToken, applyFilter);

export default router;*/

import express from "express";
import { createOrUpdateFilter, editFilter, duplicateFilter, getFilters, previewAudience,applyFilter, getSingleFilter, deleteFilter } from "../controllers/filterController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", /*authenticateToken,*/ createOrUpdateFilter); // Create/Update Filter
router.put("/:filterId", /*authenticateToken,*/ editFilter); // Edit Filter
router.post("/:filterId/duplicate", /*authenticateToken,*/ duplicateFilter); // Duplicate Filter
router.get("/", /*authenticateToken,*/ getFilters); // Get All Filters
router.get("/:filterId", /*authenticateToken,*/ getSingleFilter); // Get Single Filters
router.get("/apply/:filterId", /*authenticateToken,*/ /*applyFilter*/ getSingleFilter);
router.post("/preview", /*authenticateToken,*/ previewAudience); // Get Estimated Audience
router.delete("/:filterId", /*authenticateToken,*/ deleteFilter); // Delete Filter

export default router;
