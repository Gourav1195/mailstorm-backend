import { Request, Response } from "express";
import EmailLog from "../models/EmailLog";

export const getEmailReports = async (req: Request, res: Response) => {
  try {
    const { search, sortBy = "dateSent", order = "desc", page = "1", limit = "10" } = req.query;

    // Convert pagination values to numbers
    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;
    const skip = (pageNumber - 1) * pageSize;

    // Construct query for search filtering
    let query: any = {};
    if (search) {
      query.emailName = { $regex: search as string, $options: "i" };
    }

    // Fetch data with sorting, pagination, and search filtering
    const emailReports = await EmailLog.find(query)
      .sort({ [sortBy as string]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(pageSize);

    // Format response to match UI requirements
    const formattedReports = emailReports.map((report) => ({
        emailName: report.emailName,
        category: report.category,
        dateSent: report.dateSent.toISOString().split("T")[0],
        emailsSent: report.emailsSent.toLocaleString(),
        opens: `${report.opens} (${((report.opens / report.emailsSent) * 100).toFixed(2)}%)`, // ✅ FIXED
        clicks: `${report.clicks} (${((report.clicks / report.emailsSent) * 100).toFixed(2)}%)`,
        unsubscribes: `${report.unsubscribes} (${((report.unsubscribes / report.emailsSent) * 100).toFixed(2)}%)`,
        bounces: `${report.bounces} (${((report.bounces / report.emailsSent) * 100).toFixed(2)}%)`,
      }));
      

    // Get total count for pagination
    const totalCount = await EmailLog.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: formattedReports,
      pagination: {
        total: totalCount,
        page: pageNumber,
        limit: pageSize,
      },
    });
  } catch (error) {
    console.error("Error fetching email reports:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
