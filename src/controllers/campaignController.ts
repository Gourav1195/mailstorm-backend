
import { Request, Response } from "express";
import User from "../models/User";
import Campaign, { ICampaign } from "../models/Campaign"; // ✅ Import `ICampaign`

export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const {
      search,
      status,
      type,
      startDate,
      endDate,
      sortBy = "createdAt", // Default Sort By `createdAt`
      order = "desc", // Default Order `desc`
      page = "1",
      limit = "10",
    } = req.query;

    let query: any = {};

    // ✅ Search by Campaign Name (Case-Insensitive)
    if (search) {
      query.name = { $regex: search as string, $options: "i" };
    }

    // ✅ Filter by Status (Handle Spaces & Multiple Statuses)
    if (status) {
      const statusArray = (status as string).split(",").map((s) => s.trim());
      query.status = { $in: statusArray };
    }

    // ✅ Filter by Type (Allow Multiple Types)
    if (type) {
      query.type = { $in: (type as string).split(",").map((t) => t.trim()) };
    }

    // ✅ Filter by Date Range
    if (startDate && endDate) {
      query.publishedDate = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // ✅ Pagination (Always Apply)
    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // ✅ Sorting
    const sortField = sortBy as string;
    const sortOrder = order === "desc" ? -1 : 1;

    console.log("Final Query:", JSON.stringify(query, null, 2)); // ✅ Debug Query

    // ✅ Fetch Campaigns with Filters, Sorting & Pagination
    const campaigns = await Campaign.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(pageSize);

    // ✅ Get Total Count for Pagination
    const totalCount = await Campaign.countDocuments(query);

    res.status(200).json({
      success: true,
      data: campaigns,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// ✅ Create or Update a Campaign
export const createOrUpdateCampaign = async (req: Request, res: Response) => {
  try {
    const { name, type, audience, template, schedule, status } = req.body;

    if (!name || !type || !audience || !template /*|| !schedule*/) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCampaign = new Campaign({
      name,
      type,
      audience,
      template,
      userId: "67daedeaff85ef645f71206f",
      schedule: schedule || null, // ✅ Allow null schedule
      status: status || "Draft",
    });

    await newCampaign.save();
    res.status(201).json({ message: "Campaign Saved Successfully", campaign: newCampaign });
  } catch (error) {
    console.error("Error saving campaign:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Edit a Campaign
export const editCampaign = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;

    const updatedData = req.body;

    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      updatedData,
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json({ message: "Campaign Updated Successfully", campaign });
  } catch (error) {
    console.error("Error updating campaign:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get Campaign Details by campaignId
export const getCampaignById = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params; // Extract campaignId from request parameters

    // ✅ Find campaign by ID
    const campaign = await Campaign.findById(campaignId);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json({
      success: true,
      campaign,
    });
  } catch (error) {
    console.error("Error fetching campaign details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Pause/Resume Campaign
export const toggleCampaignStatus = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // Toggle status
    campaign.status = campaign.status === "On Going" ? "Paused" : "On Going";
    await campaign.save();

    console.log("Updated Campaign:", campaign); // ✅ Log updated campaign

    return res.status(200).json({ message: `Campaign ${campaign.status} Successfully`, campaign });
  } catch (error) {
    console.error("Error updating campaign status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Duplicate a Campaign
export const duplicateCampaign = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;

    const originalCampaign = await Campaign.findById(campaignId);

    if (!originalCampaign) {
      return res.status(404).json({ message: "Original campaign not found" });
    }

    // ✅ Convert to a plain object and remove `_id`
    const campaignData = originalCampaign.toObject();
    delete campaignData._id; // Remove _id to create a new entry

    // ✅ Set new name, createdAt, and publishedDate
    campaignData.name = `Copy of ${originalCampaign.name}`;
    campaignData.createdAt = new Date();
    campaignData.publishedDate = new Date(); // ✅ Set a new valid publishedDate
    campaignData.status = "Draft"; // Start as Draft

    const duplicatedCampaign = new Campaign(campaignData);
    await duplicatedCampaign.save();

    res.status(201).json({ message: "Campaign Duplicated Successfully", campaign: duplicatedCampaign });
  } catch (error) {
    console.error("Error duplicating campaign:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Launch a Campaign
export const launchCampaign = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;

    const campaign = await Campaign.findByIdAndUpdate(
      campaignId,
      { status: "Active" },
      { new: true }
    );

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json({ message: "Campaign Launched Successfully", campaign });
  } catch (error) {
    console.error("Error launching campaign:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Delete a Campaign
export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const { campaignId } = req.params;

    const campaign = await Campaign.findByIdAndDelete(campaignId);

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    res.status(200).json({ message: "Campaign deleted successfully" });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

