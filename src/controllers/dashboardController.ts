import { Request, Response } from "express";
import Campaign, { ICampaign } from "../models/Campaign";
import Filter from "../models/Filter";

const getDateRange = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const getStartOfMonth = (month: number, year: number) => new Date(year, month, 1);
const getEndOfMonth = (month: number, year: number) => new Date(year, month + 1, 0, 23, 59, 59, 999);
const getStartOfYear = (year: number) => new Date(year, 0, 1);

const getThisMonthDates = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  return { start: getStartOfMonth(month, year), end: getEndOfMonth(month, year) };
};

type TimeFilterKey = "daily" | "weekly" | "monthly" | "yearly";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();

    const timeFilters: Record<TimeFilterKey, Date> = {
      daily: getDateRange(1),
      weekly: getDateRange(7),
      monthly: getDateRange(30),
      yearly: getStartOfYear(currentYear),
    };

    const totalCampaigns = await Campaign.countDocuments();
    const totalFilters = await Filter.countDocuments();

    const getCountAndPercentage = async (query: any, total: number) => {
      const count = await Campaign.countDocuments(query);
      const percentage = total > 0 ? +(count / total * 100).toFixed(2) : 0;
      return { count, percentage };
    };

    const activeCampaigns: Record<TimeFilterKey, any> = {
      daily: await getCountAndPercentage({ status: "Active", createdAt: { $gte: timeFilters.daily } }, totalCampaigns),
      weekly: await getCountAndPercentage({ status: "Active", createdAt: { $gte: timeFilters.weekly } }, totalCampaigns),
      monthly: await getCountAndPercentage({ status: "Active", createdAt: { $gte: timeFilters.monthly } }, totalCampaigns),
      yearly: await getCountAndPercentage({ status: "Active", createdAt: { $gte: timeFilters.yearly } }, totalCampaigns),
    };

    const scheduledCampaigns: Record<TimeFilterKey, any> = {
      daily: await getCountAndPercentage({ status: "Scheduled", "schedule.startDate": { $gte: timeFilters.daily } }, totalCampaigns),
      weekly: await getCountAndPercentage({ status: "Scheduled", "schedule.startDate": { $gte: timeFilters.weekly } }, totalCampaigns),
      monthly: await getCountAndPercentage({ status: "Scheduled", "schedule.startDate": { $gte: timeFilters.monthly } }, totalCampaigns),
      yearly: await getCountAndPercentage({ status: "Scheduled", "schedule.startDate": { $gte: timeFilters.yearly } }, totalCampaigns),
    };

    const totalAudience: Record<TimeFilterKey, any> = {
      daily: await getCountAndPercentage({ createdAt: { $gte: timeFilters.daily } }, totalFilters),
      weekly: await getCountAndPercentage({ createdAt: { $gte: timeFilters.weekly } }, totalFilters),
      monthly: await getCountAndPercentage({ createdAt: { $gte: timeFilters.monthly } }, totalFilters),
      yearly: await getCountAndPercentage({ createdAt: { $gte: timeFilters.yearly } }, totalFilters),
    };

    const emailsSentStats: Partial<Record<TimeFilterKey, any>> = {};
    for (const key of Object.keys(timeFilters) as TimeFilterKey[]) {
      const campaigns = await Campaign.find({ createdAt: { $gte: timeFilters[key] } });
      emailsSentStats[key] = {
        emailsSent: campaigns.length,
        campaigns: campaigns.map(c => ({
          campaignId: c._id,
          openRate: c.openRate ?? 0,
          clickRate: c.ctr ?? 0
        }))
      };
    }

    const monthlyEmailStats = await Promise.all(
      Array.from({ length: 12 }, async (_, month) => {
        const from = getStartOfMonth(month, currentYear);
        const to = getEndOfMonth(month, currentYear);
        const campaigns = await Campaign.find({ createdAt: { $gte: from, $lte: to } });

        const daily = campaigns.filter(c => c.schedule?.frequency === "Daily");
        const weekly = campaigns.filter(c => c.schedule?.frequency === "Weekly");
        const monthly = campaigns.filter(c => c.schedule?.frequency === "Monthly");

        return {
          month: from.toLocaleString("default", { month: "short" }),
          daily: {
            emailsSent: daily.length,
            campaigns: daily.map(c => ({
              campaignId: c._id,
              openRate: c.openRate ?? 0,
              clickRate: c.ctr ?? 0,
            }))
          },
          weekly: {
            emailsSent: weekly.length,
            campaigns: weekly.map(c => ({
              campaignId: c._id,
              openRate: c.openRate ?? 0,
              clickRate: c.ctr ?? 0,
            }))
          },
          monthly: {
            emailsSent: monthly.length,
            campaigns: monthly.map(c => ({
              campaignId: c._id,
              openRate: c.openRate ?? 0,
              clickRate: c.ctr ?? 0,
            }))
          }
        };
      })
    );

    const { start, end } = getThisMonthDates();
    const currentMonthCampaigns = await Campaign.find({ createdAt: { $gte: start, $lte: end } });

    const getPerformanceDataByFrequency = (campaigns: ICampaign[], frequency: "Daily" | "Weekly" | "Monthly") => {
      return campaigns
        .filter(c => c.schedule?.frequency === frequency)
        .map(c => ({
          campaignId: c._id,
          date: c.createdAt.toISOString().slice(0, 10),
          openRate: c.openRate ?? 0,
          clickRate: c.ctr ?? 0,
        }));
    };

    const campaignPerformance = {
      daily: getPerformanceDataByFrequency(currentMonthCampaigns, "Daily"),
      weekly: getPerformanceDataByFrequency(currentMonthCampaigns, "Weekly"),
      monthly: getPerformanceDataByFrequency(currentMonthCampaigns, "Monthly"),
      yAxisMax: 1000,
    };
    const recentActivity = await Campaign.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "firstName lastName email")
      .select("name createdAt userId");

    const monthlyCampaigns = emailsSentStats.monthly?.campaigns || [];
    const avgOpenRate = monthlyCampaigns.length
      ? +(monthlyCampaigns.reduce((sum: number, c: any) => sum + c.openRate, 0) / monthlyCampaigns.length).toFixed(2)
      : 0;

    const avgClickRate = monthlyCampaigns.length
      ? +(monthlyCampaigns.reduce((sum: number, c: any) => sum + c.clickRate, 0) / monthlyCampaigns.length).toFixed(2)
      : 0;


    res.status(200).json({
      activeCampaigns,
      scheduledCampaigns,
      totalAudience,
      emailsSent: {
        ...emailsSentStats,
        monthlyStats: monthlyEmailStats,
        yAxisMax: 2000,
      },
      campaignPerformance,
      engagementMetrics: {
        openRate: `${avgOpenRate}%`,
        clickRate: `${avgClickRate}%`,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
