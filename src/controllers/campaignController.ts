
import { Request, Response } from "express";
import User from "../models/User";
import Campaign, { ICampaign } from "../models/Campaign"; // ✅ Import `ICampaign`
import { snapshotAudience } from "../services/snapshotAudience";
import { enqueueCampaignExecution } from "../services/enqueueCampaignExecution";
import Filter from "../models/Filter";
import { hashFilter } from "../utils/hashFilter"; // ✅ Import hashFilter utility (adjust path if needed)
import CampaignRecipient from "../models/CampaignRecipient";

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

export const createCampaign = async (req: Request, res: Response) => {
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({
      message: "Name and type are required to create a campaign"
    });
  }

  const campaign = await Campaign.create({
    name,
    type,
    userId: "67daedeaff85ef645f71206f",
    status: "Draft",
    executionEnqueued: false,
    audienceSnapshotted: false,
    openRate: 0,
    ctr: 0,
    delivered: 0
  });

  res.status(201).json({ campaign });
};


// ✅ Create or Update a Campaign
export const createOrUpdateCampaign = async (req: Request, res: Response) => {
  try {
    const { action, ...payload } = req.body;
    const { campaignId } = req.params;

    let campaign;

    if (campaignId) {
      campaign = await Campaign.findByIdAndUpdate(
        campaignId,
        payload,
        { new: true }
      );
    } else {
      campaign = await Campaign.create({
        ...payload,
        status: "Draft", // backend-owned
        executionEnqueued: false,
        audienceSnapshotted: false
      });
    }

    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    // 🔥 THE ONLY PLACE WHERE SCHEDULING HAPPENS
    if (action === "Scheduled") {
      if (campaign.status !== "Draft") {
        return res.status(400).json({ message: "Invalid state transition" });
      }

      // snapshot audience (re-snapshot if filter changed)
      const filter = await Filter.findById(campaign.audience).lean();
      if (!filter) throw new Error("Audience filter not found");

      await CampaignRecipient.deleteMany({ campaignId: campaign._id });
      await snapshotAudience(campaign._id.toString(), filter);

      await enqueueCampaignExecution(campaign._id.toString());

      campaign.status = "Scheduled";
      campaign.executionEnqueued = true;
      campaign.audienceSnapshotted = true;

      await campaign.save();
    }

    res.json({ campaign });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Edit a Campaign
// export const editCampaign = async (req: Request, res: Response) => {
//   const { campaignId } = req.params;
//   const updatedData = req.body;

//   const campaign = await Campaign.findByIdAndUpdate(
//     campaignId,
//     updatedData,
//     { new: true }
//   );

//   if (!campaign) {
//     return res.status(404).json({ message: "Campaign not found" });
//   }

//   res.json({ campaign });
// };
// // ✅ Schedule a Campaign

// export const scheduleCampaign = async (req: Request, res: Response) => {
//   const { campaignId } = req.params;

//   const campaign = await Campaign.findById(campaignId);
//   if (!campaign) return res.status(404).json({ message: "Not found" });

//   // 🔒 backend validation
//   if (!campaign.audience || !campaign.template || !campaign.schedule) {
//     return res.status(400).json({
//       message: "Audience, template and schedule required"
//     });
//   }

//   if (campaign.status !== "Draft") {
//     return res.status(400).json({
//       message: "Only Draft campaigns can be scheduled"
//     });
//   }

//   // snapshot audience
//   if (!campaign.audienceSnapshotted) {
//     const filter = await Filter.findById(campaign.audience).lean();
//     await snapshotAudience(campaign._id.toString(), filter);
//     campaign.audienceSnapshotted = true;
//   }

//   // enqueue jobs
//   await enqueueCampaignExecution(campaign._id.toString());

//   campaign.status = "Scheduled";
//   await campaign.save();

//   res.json({ message: "Campaign scheduled", campaign });
// };


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
    campaign.status = campaign.status === "Active" ? "Paused" : "Active";
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

