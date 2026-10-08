import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config.js";

export interface UserClaims {
  userId: number;
  role: "resident" | "admin";
  name: string;
  flat: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: UserClaims;
  }
}

export const readAccessToken = (token?: string): UserClaims | null => {
  if (!token) return null;
  try {
    const p = jwt.verify(token, env.accessJwtSecret) as jwt.JwtPayload;
    return { userId: Number(p.sub), role: p.role, name: p.name, flat: p.flat };
  } catch {
    return null;
  }
};

export const signInternalToken = (user?: UserClaims) =>
  jwt.sign({ ...(user ?? {}) }, env.internalJwtSecret, { expiresIn: "30s" });

export const requireLogin = (req: Request, res: Response, next: NextFunction) => {
  const user = readAccessToken(req.cookies?.access_token);
  if (!user) {
    return res.status(401).json({ success: false, message: "Please log in to continue.", data: null, meta: null });
  }
  req.user = user;
  next();
};

export const attachUserIfPresent = (req: Request, _res: Response, next: NextFunction) => {
  const user = readAccessToken(req.cookies?.access_token);
  if (user) req.user = user;
  next();
};
