import { Request, Response } from "express";
import User from "../models/User";
import Filter from "../models/Filter";
import Campaign from "../models/Campaign"; // Import Campaign model

/*export const createOrUpdateFilter = async (req: Request, res: Response) => {
  try {
    const { name, description, tags, conditions, logicalOperator, customFields, isDraft } = req.body;

    // ✅ Validate required fields
    if (!name || !conditions) {
      return res.status(400).json({ message: "Name and conditions are required." });
    }

    // ✅ Validate conditions array
    if (!Array.isArray(conditions) || conditions.length === 0) {
      return res.status(400).json({ message: "Conditions should be an array of groups." });
    }

    // ✅ No Campaign validation anymore

    let isTriggerFilter = false; // 🔥 By default, treat as Filter Components (isTriggerFilter = false)

    const structuredGroups = conditions.map((group: any, index: number) => {
      if (index === 0) {
        // First Group
        if (!isTriggerFilter && group.groupOperator !== "AND") {
          throw new Error("In Filter Components, Group 1 must have an AND operator.");
        }
        // For Trigger Filters, we allow both AND/OR in Group 1 (if we bring back campaign later)
      } else {
        if (!isTriggerFilter && group.groupOperator !== "AND") {
          throw new Error("Each group in Filter Components must have an AND operator.");
        }
      }

      return {
        groupId: group.groupId || `Group_${Date.now()}`,
        groupOperator: isTriggerFilter
          ? group.groupOperator || "OR"
          : "AND",
        criteria: group.criteria.map((condition: any) => ({
          field: condition.field,
          operator: condition.operator,
          value: condition.value,
        })),
      };
    });

    // ✅ Handle logicalOperator properly
    let finalLogicalOperator: string | undefined = undefined;
    if (conditions.length === 1) {
      // Only one group
      finalLogicalOperator = "OR"; // Always set OR if only one group
    } else {
      // More than one group
      if (!isTriggerFilter) {
        if (!logicalOperator || logicalOperator !== "OR") {
          return res.status(400).json({ message: "Filter Components must have an OR operator between groups." });
        }
        finalLogicalOperator = "OR";
      } else {
        if (!logicalOperator || (logicalOperator !== "AND" && logicalOperator !== "OR")) {
          return res.status(400).json({ message: "Trigger Filters must have AND/OR operator between groups." });
        }
        finalLogicalOperator = logicalOperator;
      }
    }

    let updatedCustomFields = {};
    if (customFields && typeof customFields === "object") {
      updatedCustomFields = customFields;
    }

    const estimatedAudience = Math.floor(Math.random() * 10000);

    // ✅ Build the new filter document (without campaignId)
    const newFilter = new Filter({
      name,
      description,
      tags,
      userId: "67daedeaff85ef645f71206f", // ✅ Hardcoded userId
      conditions: structuredGroups,
      logicalOperator: finalLogicalOperator,
      customFields: updatedCustomFields,
      estimatedAudience,
      isDraft,
    });

    await newFilter.save();
    res.status(201).json({ message: "Filter Saved Successfully", filter: newFilter });

  } catch (error: unknown) {
    console.error("Error saving filter:", error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: "An unknown error occurred" });
    }
  }
};*/

export const createOrUpdateFilter = async (req: Request, res: Response) => {
  try {
    const { name, description, tags, conditions, logicalOperator, customFields, isDraft, isTriggerFilter } = req.body;

    // ✅ Validate required fields
    if (!name || !conditions) {
      return res.status(400).json({ message: "Name and conditions are required." });
    }

    if (!Array.isArray(conditions) || conditions.length === 0) {
      return res.status(400).json({ message: "Conditions should be an array of groups." });
    }

    // ✅ Group structure validation
    const structuredGroups = conditions.map((group: any) => {
      if (!group.groupOperator || (group.groupOperator !== "AND" && group.groupOperator !== "OR")) {
        throw new Error("Each group must have a valid groupOperator: AND or OR.");
      }

      return {
        groupId: group.groupId || `Group_${Date.now()}`,
        groupOperator: group.groupOperator,
        criteria: group.criteria.map((condition: any) => ({
          field: condition.field,
          operator: condition.operator,
          value: condition.value,
        })),
      };
    });

    // ✅ Logical Operator handling
    let finalLogicalOperator: string;
    if (conditions.length === 1) {
      finalLogicalOperator = "OR"; // default to OR for single group
    } else {
      if (!logicalOperator || (logicalOperator !== "AND" && logicalOperator !== "OR")) {
        return res.status(400).json({ message: "LogicalOperator between groups must be AND or OR." });
      }
      finalLogicalOperator = logicalOperator;
    }

    // ✅ Custom fields setup
    let updatedCustomFields = {};
    if (customFields && typeof customFields === "object") {
      updatedCustomFields = customFields;
    }

    const estimatedAudience = Math.floor(Math.random() * 10000); // stubbed

    const newFilter = new Filter({
      name,
      description,
      tags,
      userId: "67daedeaff85ef645f71206f",
      conditions: structuredGroups,
      logicalOperator: finalLogicalOperator,
      customFields: updatedCustomFields,
      estimatedAudience,
      isDraft,
      isTriggerFilter: typeof isTriggerFilter === "boolean" ? isTriggerFilter : false, // ✅ Added
    });

    await newFilter.save();
    res.status(201).json({ message: "Filter Saved Successfully", filter: newFilter });

  } catch (error: unknown) {
    console.error("Error saving filter:", error);
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: "An unknown error occurred" });
    }
  }
};





// campaignId removed from editFilter function
/*export const editFilter = async (req: Request, res: Response) => {
  try {
    const { filterId } = req.params;
    const {
      name,
      description,
      tags,
      conditions,
      logicalOperator,
      customFields,
      isDraft,
    } = req.body;

    // ✅ Validate required fields
    if (!name || !conditions) {
      return res.status(400).json({
        message: "Name and conditions are required.",
      });
    }

    // ✅ Validate conditions format
    if (!Array.isArray(conditions) || conditions.length === 0) {
      return res.status(400).json({
        message: "Conditions should be an array of groups.",
      });
    }

    // ✅ No Campaign check anymore
    let isTriggerFilter = false; // 🔥 Default assume it is Filter Components (not Trigger Filters)

    // ✅ Processing Conditions (Handling Filter Components & Trigger Filters Logic)
    const structuredGroups = conditions.map((group: any, index: number) => {
      if (index === 0) {
        // ✅ Group 1 validation
        if (!isTriggerFilter && group.groupOperator !== "AND") {
          throw new Error("In Filter Components, Group 1 must have an AND operator.");
        }
        // ✅ Trigger Filters: allow AND/OR for Group 1
      } else {
        // ✅ Group 2, Group 3, etc
        if (!isTriggerFilter && group.groupOperator !== "AND") {
          throw new Error("Each group in Filter Components must have an AND operator.");
        }
        // ✅ Trigger Filters: allow AND/OR between groups
      }

      return {
        groupId: group.groupId || `Group_${Date.now()}`,
        groupOperator: isTriggerFilter ? group.groupOperator || "OR" : "AND",
        criteria: group.criteria.map((condition: any) => ({
          field: condition.field,
          operator: condition.operator,
          value: condition.value,
        })),
      };
    });

    // ✅ Enforce logicalOperator validation
    if (conditions.length > 1) {
      if (!isTriggerFilter && logicalOperator !== "OR") {
        return res.status(400).json({
          message: "Filter Components must have an OR operator between groups.",
        });
      }
      if (isTriggerFilter && (!logicalOperator || (logicalOperator !== "AND" && logicalOperator !== "OR"))) {
        return res.status(400).json({
          message: "Trigger Filters must have an AND or OR operator between groups.",
        });
      }
    }

    // ✅ Handle Custom Fields
    let updatedCustomFields = {};
    if (customFields && typeof customFields === "object") {
      updatedCustomFields = customFields;
    }

    // ✅ Dummy Audience Estimation Logic
    const estimatedAudience = Math.floor(Math.random() * 10000);

    // ✅ Find and update the filter (no campaignId anymore)
    const updatedFilter = await Filter.findOneAndUpdate(
      { _id: filterId, userId: "67daedeaff85ef645f71206f" },
      {
        name,
        description,
        tags,
        conditions: structuredGroups,
        logicalOperator: conditions.length === 1 ? "OR" : logicalOperator,
        customFields: updatedCustomFields,
        estimatedAudience,
        isDraft,
        lastModified: new Date(),
      },
      { new: true }
    ).lean();

    if (!updatedFilter) {
      return res.status(404).json({ message: "Filter not found" });
    }

    // ✅ Response without campaignType (because campaign is removed)
    res.status(200).json({
      message: "Filter Updated Successfully",
      filter: updatedFilter,
    });
  } catch (error: unknown) {
    console.error("Error updating filter:", error);

    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: "An unknown error occurred" });
    }
  }
};*/

// ✅ Edit a Filter (without campaignId)

export const editFilter = async (req: Request, res: Response) => {
  try {
    const { filterId } = req.params;
    const {
      name,
      description,
      tags,
      conditions,
      logicalOperator,
      customFields,
      isDraft,
      isTriggerFilter, // ✅ optional field
    } = req.body;

    // ✅ Validate required fields
    if (!name || !conditions) {
      return res.status(400).json({
        message: "Name and conditions are required.",
      });
    }

    if (!Array.isArray(conditions) || conditions.length === 0) {
      return res.status(400).json({
        message: "Conditions should be an array of groups.",
      });
    }

    // ✅ Group and Criteria Mapping
    const structuredGroups = conditions.map((group: any) => {
      if (!group.groupOperator || (group.groupOperator !== "AND" && group.groupOperator !== "OR")) {
        throw new Error("Each group must have a valid groupOperator: AND or OR.");
      }

      return {
        groupId: group.groupId || `Group_${Date.now()}`,
        groupOperator: group.groupOperator,
        criteria: group.criteria.map((condition: any) => ({
          field: condition.field,
          operator: condition.operator,
          value: condition.value,
        })),
      };
    });

    // ✅ Logical Operator Handling
    let finalLogicalOperator: string;
    if (conditions.length === 1) {
      finalLogicalOperator = "OR";
    } else {
      if (!logicalOperator || (logicalOperator !== "AND" && logicalOperator !== "OR")) {
        return res.status(400).json({
          message: "LogicalOperator between groups must be AND or OR.",
        });
      }
      finalLogicalOperator = logicalOperator;
    }

    // ✅ Prepare Custom Fields
    let updatedCustomFields = {};
    if (customFields && typeof customFields === "object") {
      updatedCustomFields = customFields;
    }

    const estimatedAudience = Math.floor(Math.random() * 10000);

    // ✅ Prepare update object
    const updateData: any = {
      name,
      description,
      tags,
      conditions: structuredGroups,
      logicalOperator: finalLogicalOperator,
      customFields: updatedCustomFields,
      estimatedAudience,
      isDraft,
      lastModified: new Date(),
      isTriggerFilter: typeof isTriggerFilter === "boolean" ? isTriggerFilter : false, // ✅ apply default if not provided
    };

    // ✅ Update filter
    const updatedFilter = await Filter.findOneAndUpdate(
      { _id: filterId, userId: "67daedeaff85ef645f71206f" },
      updateData,
      { new: true }
    ).lean();

    if (!updatedFilter) {
      return res.status(404).json({ message: "Filter not found" });
    }

    res.status(200).json({
      message: "Filter Updated Successfully",
      filter: updatedFilter,
    });

  } catch (error: unknown) {
    console.error("Error updating filter:", error);

    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(400).json({ message: "An unknown error occurred" });
    }
  }
};





// ✅ Duplicate a Filter with Conditions
export const duplicateFilter = async (req: Request, res: Response) => {
  try {
    const { filterId } = req.params;
    const originalFilter = await Filter.findById(filterId);

    if (!originalFilter) {
      return res.status(404).json({ message: "Original filter not found" });
    }

    // ✅ Convert document to plain object
    const filterData = originalFilter.toObject() as Record<string, any>;

    delete filterData._id;        // ✅ Remove _id to avoid MongoDB conflict
    delete filterData.createdAt;  // ✅ Remove createdAt to reset creation time
    delete filterData.campaignId; // ✅ Remove campaignId completely

    // ✅ Generate a unique name for duplicated filter
    filterData.name = `Copy of ${originalFilter.name}`;

    // ✅ Validate and format conditions array
    if (Array.isArray(filterData.conditions)) {
      filterData.conditions = filterData.conditions.map((condition: any) => ({
        ...condition,
        groupOperator: condition.groupOperator || "AND", // Default to "AND" if missing
      }));
    } else {
      return res.status(400).json({ message: "Invalid conditions format" });
    }

    const duplicatedFilter = new Filter(filterData);
    await duplicatedFilter.save();

    res.status(201).json({
      message: "Filter Duplicated Successfully",
      filter: {
        ...duplicatedFilter.toObject(),
        originalId: filterId, // ✅ Needed by frontend to insert next to original
      },
    });
    
  } catch (error) {
    console.error("Error duplicating filter:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// ✅ Get All Filters for a User with Pagination, Search & Sorting 
export const getFilters = async (req: Request, res: Response) => {
  try {
    const userId = "67daedeaff85ef645f71206f"; // Static userId (Replace with actual user authentication)

    // Extract query parameters
    let { page = "1", limit = "10", search = "", sortBy = "createdAt", order = "desc", isDraft } = req.query;

    // Convert page & limit to numbers
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Search filter (case-insensitive search by name)
    const searchQuery = search ? { name: { $regex: search, $options: "i" } } : {};

    // Draft filter logic
    let draftFilter = {};
    if (isDraft !== undefined) {
      draftFilter = { isDraft: isDraft === "true" }; // Convert string to boolean
    }

    // Sorting order (ascending or descending)
    const sortOrder = order === "asc" ? 1 : -1;

    // Combine all filters
    const query = {
      userId,
      ...searchQuery,
      ...draftFilter
    };

    // Fetch filters (no populate for campaignId anymore)
    const filters = await Filter.find(query)
      .sort({ [sortBy as string]: sortOrder })
      .skip(skip)
      .limit(limitNumber);

    // Get total count for pagination
    const totalFilters = await Filter.countDocuments(query);
    const totalPages = Math.ceil(totalFilters / limitNumber);

    res.status(200).json({
      success: true,
      message: "Filters fetched successfully",
      filters,
      pagination: {
        total: totalFilters,
        page: pageNumber,
        limit: limitNumber,
        totalPages
      }
    });
  } catch (error) {
    console.error("Error fetching filters:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// ✅ Get a Single Filter with Grouping Logic
export const getSingleFilter = async (req: Request, res: Response) => {
  try {
    const filterId = req.params.filterId;

    // Fetch filter
    const filter = await Filter.findById(filterId).lean();

    if (!filter) {
      return res.status(404).json({ message: "Filter not found" });
    }

    if (!filter.conditions || filter.conditions.length === 0) {
      return res.status(200).json({
        message: "No conditions found for this filter",
        filter: {
          ...filter,
          isTriggerFilter: typeof filter.isTriggerFilter === "boolean" ? filter.isTriggerFilter : false,
          groups: [],
        }
      });
    }

    // ✅ Group conditions by groupId
    const groupedConditions: Record<string, { groupOperator: string; conditions: any[] }> = {};

    filter.conditions.forEach((condition: any) => {
      if (condition?.groupId && condition?.criteria) {
        const groupId = condition.groupId;
        if (!groupedConditions[groupId]) {
          groupedConditions[groupId] = {
            groupOperator: condition.groupOperator || "AND",
            conditions: []
          };
        }

        condition.criteria.forEach((criteria: any) => {
          groupedConditions[groupId].conditions.push({
            field: criteria.field,
            operator: criteria.operator,
            value: criteria.value,
          });
        });
      }
    });

    // ✅ Convert to frontend-compatible structure
    const groups = Object.keys(groupedConditions).map(groupId => ({
      groupId,
      groupOperator: groupedConditions[groupId].groupOperator,
      conditions: groupedConditions[groupId].conditions,
    }));

    res.status(200).json({
      id: filter._id,
      name: filter.name,
      description: filter.description,
      tags: filter.tags,
      lastUsed: filter.lastUsed,
      ctr: filter.ctr,
      createdOn: filter.createdAt,
      audienceCount: filter.estimatedAudience,
      customFields: filter.customFields || {},
      logicalOperator: filter.logicalOperator || "OR",
      isTriggerFilter: typeof filter.isTriggerFilter === "boolean" ? filter.isTriggerFilter : false, // ✅ Added here
      groups,
    });
  } catch (error) {
    console.error("Error fetching filter:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



// ✅ Preview Estimated Audience Based on Conditions
export const previewAudience = async (req: Request, res: Response) => {
  try {
    const { conditions } = req.body;

    if (!conditions || conditions.length === 0) {
      return res.status(400).json({ message: "Conditions are required for preview" });
    }

    // Dummy Audience Estimation Logic (Replace with real DB Query)
    const estimatedAudience = Math.floor(Math.random() * 10000);

    res.status(200).json({ estimatedAudience, message: "Audience preview generated successfully" });
  } catch (error) {
    console.error("Error generating audience preview:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Apply filter to get matching users
export const applyFilter = async (req: Request, res: Response) => {
  try {
    const { filterId } = req.params;
    const filter = await Filter.findById(filterId);
    if (!filter) return res.status(404).json({ message: "Filter not found" });

    let query: any = {};
    let andConditions: any[] = [];
    let orConditions: any[] = [];

    filter.conditions.forEach((cond: any) => {
      if (cond.operator === "AND") {
        query["$and"] = andConditions;
      } else if (cond.operator === "OR") {
        query["$or"] = orConditions;
      } else {
        const condition = { [cond.field]: { [`$${cond.operator}`]: cond.value } };
        andConditions.push(condition);
        orConditions.push(condition);
      }
    });

    const users = await User.find(query);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error applying filter", error });
  }
};

// ✅ Delete a Filter
export const deleteFilter = async (req: Request, res: Response) => {
  try {
    const { filterId } = req.params;
    const filter = await Filter.findOneAndDelete({
      _id: filterId, /*userId: req.user.id*/
      /*userId: (req as any).user.id*/
      userId: "67daedeaff85ef645f71206f"
    });

    if (!filter) {
      return res.status(404).json({ message: "Filter not found" });
    }

    res.status(200).json({ message: "Filter deleted successfully" });
  } catch (error) {
    console.error("Error deleting filter:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

