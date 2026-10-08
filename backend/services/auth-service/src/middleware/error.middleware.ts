import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import multer from "multer";
import { AppError } from "../utils/AppError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const notFoundHandler = (_req: Request, res: Response) =>
  ApiResponse.error(res, 404, "We could not find what you were looking for.");

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) return ApiResponse.error(res, err.statusCode, err.message, err.errors);
  if (err instanceof ZodError) {
    const errors: Record<string, string> = {};
    err.issues.forEach((i) => {
      const key = i.path.join(".") || "form";
      if (!errors[key]) errors[key] = i.message;
    });
    return ApiResponse.error(res, 422, "Please check the highlighted fields and try again.", errors);
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "That image is too large. Please pick one under 2 MB." : "We could not read that file.";
    return ApiResponse.error(res, 400, message);
  }
  console.error(err);
  return ApiResponse.error(res, 500, "Something went wrong on our side. Please try again in a moment.");
};
