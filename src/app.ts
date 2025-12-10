import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";

import connectDB from "./config/db";
import campaignRoutes from "./routes/campaignRoutes";
import authRoutes from "./routes/authRoutes";
import { errorHandler } from "./middleware/errorHandler";
import logger from "./utils/logger";
import activityRoutes from "./routes/activityRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import filterRoutes from "./routes/filterRoutes";
import templateRoutes from "./routes/templateRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import emailRoutes from "./routes/emailRoutes";
import criteriaBlockRoutes from './routes/criteriaBlockRoutes'; // Import Criteria Block Routes

import dotenv from "dotenv";

dotenv.config();

const app = express();
// Use Morgan for logging HTTP requests
app.use(morgan("dev"));
// Use Helmet for security headers
app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(helmet());

// Request Logging
app.use(morgan("combined", { stream: { write: (msg:any) => logger.info(msg.trim()) } }));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/activity-logs", activityRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/filters", filterRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/dashboard", dashboardRoutes); // Register Dashboard Routes
app.use("/api/emails", emailRoutes);
app.use('/api/criteria-blocks', criteriaBlockRoutes);
// Global Error Handler
app.use(errorHandler);

export default app;
