import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`${req.method} ${req.url} - ${err.message}`);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: "error",
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
};
