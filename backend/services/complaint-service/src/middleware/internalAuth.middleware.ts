import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";

export interface InternalClaims {
  userId?: number;
  role?: "resident" | "admin";
  name?: string;
  flat?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    caller?: InternalClaims;
  }
}

export const internalAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.header("x-internal-token");
  if (!token) return next(new AppError(401, "This request did not come through the gateway."));
  try {
    const claims = jwt.verify(token, env.internalJwtSecret) as InternalClaims;
    req.caller = { userId: claims.userId, role: claims.role, name: claims.name, flat: claims.flat };
    next();
  } catch {
    next(new AppError(401, "This request could not be verified."));
  }
};

export const requireUser = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.caller?.userId) return next(new AppError(401, "Please log in to continue."));
  next();
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (req.caller?.role !== "admin") return next(new AppError(403, "Only society admins can do this."));
  next();
};
