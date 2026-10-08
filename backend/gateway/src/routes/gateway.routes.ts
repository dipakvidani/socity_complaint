import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { createProxyMiddleware } from "http-proxy-middleware";
import { env } from "../config.js";
import { attachUserIfPresent, requireLogin, signInternalToken } from "../middleware/auth.middleware.js";

const tooMany = (message: string) => ({ success: false, message, data: null, meta: null });

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: tooMany("Too many attempts. Please wait a few minutes and try again."),
});

const proxyTo = (target: string) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (_path, req) => (req as Request).originalUrl,
    on: {
      proxyReq: (proxyReq, req) => {
        proxyReq.setHeader("x-internal-token", signInternalToken((req as Request).user));
      },
      error: (_err, _req, res) => {
        const r = res as Response;
        if (!r.headersSent) {
          r.status(503).json({ success: false, message: "This service is not available right now. Please try again shortly.", data: null, meta: null });
        }
      },
    },
  });

export const gatewayRouter = Router();

const authProxy = proxyTo(env.authServiceUrl);
const complaintProxy = proxyTo(env.complaintServiceUrl);

gatewayRouter.post(["/auth/login", "/auth/register"], authLimiter, attachUserIfPresent, (req, res, next) => authProxy(req, res, next));
gatewayRouter.post(["/auth/refresh", "/auth/logout"], attachUserIfPresent, (req, res, next) => authProxy(req, res, next));
gatewayRouter.use("/auth", requireLogin, (req, res, next) => authProxy(req, res, next));
gatewayRouter.use("/complaints", requireLogin, (req, res, next) => complaintProxy(req, res, next));
