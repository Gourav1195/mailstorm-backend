import { Request, Response } from "express";
import Template from "../models/Template";
import { sendTestEmail } from "../utils/emailUtils"; // 🟦 Utility for sending emails
import { sendTestSMS } from "../utils/smsUtils";     // 🟦 Utility for sending SMS
import { renderToStaticMarkup } from '@usewaypoint/email-builder';

// Create a new template
export const createTemplate = async (req: Request, res: Response) => {
  try {
    const {
      name,
      subject,
      type,
      category,
      tags,
      layout,
      content,
      favorite,
      includeOptOutText,
      testEmails,
      testPhoneNumber,
      personalNote
    } = req.body;

    const existingTemplate = await Template.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({ message: "Template name already exists" });
    }

    if (!name || !type || !category || !content) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const template = new Template({
      name,
      subject,
      type,
      category,
      tags,
      layout,
      content,
      favorite: favorite || false,
      includeOptOutText: includeOptOutText || false,
      userId: "67daedeaff85ef645f71206f",
      createdAt: new Date(),
      lastModified: new Date(),
      lastUsed: new Date(), // ✅ Added
    });

    // ✅ Save to DB first
    await template.save();

    // ✅ Fire and forget for Test Email
    if (type === "Email" && testEmails) {
      (async () => {
        try {
          const emailList = testEmails
            .split(",")
            .map((email: string) => email.trim())
            .filter(Boolean);

          const formattedHeader = `
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Subject:</strong> ${subject || "N/A"}</p>
            <p><strong>Type:</strong> ${type}</p>
            <p><strong>Category:</strong> ${category}</p>
            ${tags?.length ? `<p><strong>Tags:</strong> ${tags.join(", ")}</p>` : ""}
          `;

          const renderedHTML = renderToStaticMarkup(content, { rootBlockId: 'root' });

          for (const email of emailList) {
            await sendTestEmail({
              to: email,
              subject: subject || "Test Email",
              htmlContent: `${formattedHeader}${renderedHTML}`,
              note: personalNote || "",
            });
          }
        } catch (err) {
          if (err instanceof Error) {
            console.error("Test Email send failed:", err.message);
          } else {
            console.error("Test Email send failed:", err);
          }
        }
      })();
    }

    // ✅ Fire and forget for Test SMS
    if (type === "SMS" && testPhoneNumber) {
      (async () => {
        try {
          const baseMessage =
            typeof content === "string"
              ? content
              : content?.text || "This is a test SMS message";

          const formattedSMS = `
Name: ${name}
Subject: ${subject || "N/A"}
Type: ${type}
Category: ${category}
${tags?.length ? `Tags: ${tags.join(", ")}` : ""}
Message: ${baseMessage}
      `.trim();

          await sendTestSMS({
            to: testPhoneNumber,
            message: formattedSMS,
          });
        } catch (err) {
          if (err instanceof Error) {
            console.error("Test SMS send failed:", err.message);
          } else {
            console.error("Test SMS send failed:", err);
          }
        }
      })();
    }



    res.status(201).json({
      message: "Template created successfully",
      template,
    });

  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};



// ✅ Fetch All Templates with Filters, Sorting & Pagination
export const getAllTemplates = async (req: Request, res: Response) => {
  try {
    const {
      search,
      type,
      category,
      favorite,
      sortBy = "lastModified", // ✅ Default sorting by last modified date
      order = "desc", // ✅ Default order descending
      page = "1",
      limit = "10",
    } = req.query;

    let query: any = {};

    // ✅ Search by template name or tags
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: "i" } },
        { tags: { $in: [search as string] } },
      ];
    }

    // ✅ Filter by Type
    if (type) {
      query.type = type;
    }

    // ✅ Filter by Category
    if (category) {
      query.category = category;
    }

    // ✅ Filter by Favorite Status
    if (favorite) {
      query.favorite = favorite === "true";
    }

    // ✅ Pagination
    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // ✅ Sorting
    const sortField = sortBy as string;
    const sortOrder = order === "desc" ? -1 : 1;

    console.log("Final Query:", JSON.stringify(query, null, 2)); // ✅ Debug Query

    // ✅ Fetch Templates with Filters, Sorting & Pagination
    const templates = await Template.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(pageSize);

    // ✅ Get Total Count for Pagination
    const totalCount = await Template.countDocuments(query);

    res.status(200).json({
      success: true,
      data: templates,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// ✅ Get Templates by Category with Pagination
export const getTemplatesByCategory = async (req: Request, res: Response) => {
  try {
    const {
      type,
      favorite,
      sortBy = "lastModified",
      order = "desc",
      page = "1",
      limit = "10",
      search,
    } = req.query;

    const { category } = req.params;

    let query: any = {
      category, // ✅ From route param
      isDeleted: false,
    };

    // ✅ Search by name or tag
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: "i" } },
        { tags: { $in: [search as string] } },
      ];
    }

    if (type) query.type = type;
    if (favorite) query.favorite = favorite === "true";

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const sortField = sortBy as string;
    const sortOrder = order === "desc" ? -1 : 1;

    const templates = await Template.find(query)
      .sort({ [sortField]: sortOrder })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await Template.countDocuments(query);

    res.status(200).json({
      success: true,
      data: templates,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching templates by category:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


//   Get a Single Template
export const getTemplateById = async (req: Request, res: Response) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: "Template not found" });
    res.json(template);
  } catch (error) {
    res.status(500).json({ message: "Error fetching template", error });
  }
};


//   Get Preview Template
export const previewTemplate = async (req: Request, res: Response) => {
  try {
    const templateId = req.params.id;
    const template = await Template.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json({
      id: template._id,
      name: template.name,
      content: template.content, // Assuming content stores HTML or JSON structure
      createdAt: template.createdAt,
    });
  } catch (error) {
    console.error("Error fetching template preview:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Preview template before savings

export const previewShowTemplate = async (req: Request, res: Response) => {
  try {
    const { htmlContent } = req.body;

    if (!htmlContent) {
      return res.status(400).json({ error: "HTML content is required for preview." });
    }

    // Send back the HTML content as response for preview
    res.status(200).json({ previewHtml: htmlContent });
  } catch (error) {
    console.error("Error previewing template:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



// ✅ Update Template with Versioning & Modification Tracking
export const updateTemplate = async (req: Request, res: Response) => {
  try {
    const {
      name,
      subject,
      content,
      type,
      category,
      tags,
      layout,
      favorite,
      includeOptOutText,
      testEmails,        // ✅ for sending test emails
      testPhoneNumber,   // ✅ for sending test SMS
      personalNote       // ✅ optional note for email
    } = req.body;

    // ✅ Find Existing Template
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ message: "Template not found" });

    // ✅ Track Previous Version (for History & Rollback)
    const previousVersion = {
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
      category: template.category,
      tags: template.tags,
      layout: template.layout,
      favorite: template.favorite,
      lastModified: template.lastModified,
    };

    // ✅ Update Template Fields
    template.name = name || template.name;
    template.subject = subject || template.subject;
    template.content = content || template.content;
    template.type = type || template.type;
    template.category = category || template.category;
    template.tags = tags || template.tags;
    template.layout = layout || template.layout;
    template.favorite = favorite !== undefined ? favorite : template.favorite;

    if (includeOptOutText !== undefined) {
      template.includeOptOutText = includeOptOutText;
    }

    // ✅ Versioning
    if (JSON.stringify(previousVersion) !== JSON.stringify(template.toObject())) {
      template.version = (template.version || 1) + 1;
    }

    template.lastModified = new Date();
    template.lastUsed = new Date(); // ✅ Added
    await template.save();

    // ✅ Fire and forget for Test Email
    if (type === "Email" && testEmails) {
      (async () => {
        try {
          const emailList = testEmails
            .split(",")
            .map((email: string) => email.trim())
            .filter(Boolean);

          const formattedHeader = `
            <p><strong>Name:</strong> ${template.name}</p>
            <p><strong>Subject:</strong> ${template.subject || "N/A"}</p>
            <p><strong>Type:</strong> ${template.type}</p>
            <p><strong>Category:</strong> ${template.category}</p>
            ${template.tags?.length ? `<p><strong>Tags:</strong> ${template.tags.join(", ")}</p>` : ""}
          `;

          const renderedHTML = renderToStaticMarkup(template.content, { rootBlockId: 'root' });

          for (const email of emailList) {
            await sendTestEmail({
              to: email,
              subject: template.subject || "Test Email",
              htmlContent: `${formattedHeader}${renderedHTML}`,
              note: personalNote || "",
            });
          }
        } catch (err) {
          console.error("Test Email send failed:", err);
        }
      })();
    }

    // ✅ Fire and forget for Test SMS
    if (type === "SMS" && testPhoneNumber) {
      (async () => {
        try {
          const baseMessage =
            typeof content === "string"
              ? content
              : content?.text || "This is a test SMS message";

          const formattedSMS = `
Name: ${template.name}
Subject: ${template.subject || "N/A"}
Type: ${template.type}
Category: ${template.category}
${template.tags?.length ? `Tags: ${template.tags.join(", ")}` : ""}
Message: ${baseMessage}
          `.trim();

          await sendTestSMS({
            to: testPhoneNumber,
            message: formattedSMS,
          });
        } catch (err) {
          console.error("Test SMS send failed:", err);
        }
      })();
    }

    res.status(200).json({
      message: "Template updated successfully",
      template,
      previousVersion,
    });
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({ message: "Error updating template", error });
  }
};




// ✅ Duplicate Template
export const duplicateTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Get template ID from request params
    const originalTemplate = await Template.findById(id);

    if (!originalTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    // ✅ Convert Mongoose Document to Plain Object
    const originalTemplateObject = originalTemplate.toObject() as Record<string, any>;

    // ✅ Remove `_id` and create a new name
    delete originalTemplateObject._id;
    originalTemplateObject.name = `Copy of ${originalTemplateObject.name}`; // Append "Copy"
    originalTemplateObject.createdAt = new Date();
    originalTemplateObject.lastModified = new Date();
     originalTemplateObject.lastUsed = new Date(); // ✅ Added
    originalTemplateObject.version = 1; // Reset version for the duplicate

    // ✅ Create a new template using the copied data
    const duplicatedTemplate = new Template(originalTemplateObject);
    await duplicatedTemplate.save();

    res.status(201).json({
      message: "Template duplicated successfully",
      template: duplicatedTemplate,
    });

  } catch (error) {
    console.error("Error duplicating template:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Soft Delete a Template (Mark as Deleted Instead of Removing)
export const deleteTemplate = async (req: Request, res: Response) => {
  try {
    const template = await Template.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Mark template as deleted instead of permanently removing
    template.isDeleted = true;
    template.deletedAt = new Date();
    await template.save();

    res.json({ message: "Template marked as deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ message: "Error deleting template", error });
  }
};

// Restore a soft-deleted template
export const restoreTemplateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const restoredTemplate = await Template.findByIdAndUpdate(
      id,
      { isDeleted: false },
      { new: true }
    );

    if (!restoredTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    res.status(200).json(restoredTemplate);
  } catch (error) {
    console.error("Restore template failed:", error);
    res.status(500).json({ message: "Failed to restore template" });
  }
};

// ✅ Permanently Delete a Template
export const permanentlyDeleteTemplate = async (req: Request, res: Response) => {
  try {
    const deletedTemplate = await Template.findByIdAndDelete(req.params.id);
    if (!deletedTemplate) return res.status(404).json({ message: "Template not found" });

    res.json({ message: "Template permanently deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error permanently deleting template", error });
  }
};


// ✅ Fetch Recently Used Templates
export const getRecentlyUsedTemplates = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string)?.trim();
    const type = req.query.type as string;
    const category = req.query.category as string;
    const sortBy = (req.query.sortBy as string) || "lastUsed";
    const order = req.query.order === "asc" ? 1 : -1;

    // Build query
    const query: any = {
      lastUsed: { $ne: null },
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    const total = await Template.countDocuments(query);

    const templates = await Template.find(query)
      .sort({ [sortBy]: order })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      templates,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching recently used templates:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//Fetch favorite templates
export const getFavoriteTemplates = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      sortBy = "createdAt",
      order = "desc",
      type,
      category,
    } = req.query;

    const filters: any = { favorite: true };

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (type) filters.type = type;
    if (category) filters.category = category;

    const skip = (+page - 1) * +limit;
    const total = await Template.countDocuments(filters);


    const templates = await Template.find(filters)
      .sort({ [sortBy as string]: order === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(+limit);

    return res.status(200).json({
      success: true,
      message: "Favorite templates fetched successfully",
      templates,
      pagination: {
        total,
        limit,
        page: +page,
        totalPages: Math.ceil(total / +limit),
      },
    });
  } catch (error) {
    console.error("Error fetching favorite templates:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// ✅ Fetch Past Campaign Templates
export const getPastCampaignTemplates = async (req: Request, res: Response) => {
  try {
    const templates = await Template.find({ lastUsed: { $ne: null } })
      .sort({ lastUsed: -1 })
      .limit(10);
    res.status(200).json(templates);
  } catch (error) {
    console.error("Error fetching past campaign templates:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Toggle Favorite Template
export const toggleFavoriteTemplate = async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;

    // ✅ Find the template first
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // ✅ Update only the `favorite` field without triggering validation
    const updatedTemplate = await Template.findByIdAndUpdate(
      templateId,
      { $set: { favorite: !template.favorite } }, // ✅ Toggle favorite
      { new: true, runValidators: false } // ✅ Disable validation to prevent errors
    );

    res.status(200).json({
      message: `Template ${updatedTemplate?.favorite ? "marked" : "removed"} as favorite`,
      template: updatedTemplate,
    });
  } catch (error) {
    console.error("Error updating favorite status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};





