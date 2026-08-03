import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/app.error.js";

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Zod Schema Validation Errors
  if (err instanceof ZodError || err?.name === "ZodError") {
    res.status(400).json({
      error: "Validation failed",
      details: err.issues || err.errors || [],
    });
    return;
  }

  // Handle Custom Application Operational Errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Handle Generic Server Errors
  console.error("[Unhandled Server Error]:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({
    error: message,
  });
}
