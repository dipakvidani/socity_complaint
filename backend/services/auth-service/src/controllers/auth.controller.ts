import { CookieOptions, NextFunction, Request, Response } from "express";
import { AuthService, ACCESS_TTL_MS, REFRESH_TTL_MS } from "../services/auth.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { loginSchema, profileSchema, registerSchema } from "../utils/validation.js";

const base: CookieOptions = { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production" };

export class AuthController {
  constructor(private service = new AuthService()) {}

  private setCookies(res: Response, t: { accessToken: string; refreshToken: string }) {
    res.cookie("access_token", t.accessToken, { ...base, path: "/", maxAge: ACCESS_TTL_MS });
    res.cookie("refresh_token", t.refreshToken, { ...base, path: "/api/auth", maxAge: REFRESH_TTL_MS });
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = registerSchema.parse(req.body);
      const user = await this.service.register(input, req.file?.buffer);
      ApiResponse.success(res, "Welcome aboard! Your account is ready. You can log in now.", user, null, 201);
    } catch (e) {
      next(e);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await this.service.login(email, password);
      this.setCookies(res, { accessToken, refreshToken });
      ApiResponse.success(res, `Welcome back, ${user.fullName.split(" ")[0]}!`, user);
    } catch (e) {
      next(e);
    }
  };

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokens = await this.service.refresh(req.cookies?.refresh_token);
      this.setCookies(res, tokens);
      ApiResponse.success(res, "Your session has been renewed.");
    } catch (e) {
      next(e);
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.service.logout(req.cookies?.refresh_token);
      res.clearCookie("access_token", { ...base, path: "/" });
      res.clearCookie("refresh_token", { ...base, path: "/api/auth" });
      ApiResponse.success(res, "You have been logged out. See you soon!");
    } catch (e) {
      next(e);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.me(req.caller!.userId!);
      ApiResponse.success(res, "Your profile is ready.", user);
    } catch (e) {
      next(e);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = profileSchema.parse(req.body);
      const { user, accessToken } = await this.service.updateProfile(req.caller!.userId!, input);
      res.cookie("access_token", accessToken, { ...base, path: "/", maxAge: ACCESS_TTL_MS });
      ApiResponse.success(res, "Your details have been updated.", user);
    } catch (e) {
      next(e);
    }
  };

  updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.updateAvatar(req.caller!.userId!, req.file?.buffer);
      ApiResponse.success(res, "Your photo has been updated.", user);
    } catch (e) {
      next(e);
    }
  };

  deleteAvatar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.service.deleteAvatar(req.caller!.userId!);
      ApiResponse.success(res, "Your photo has been removed.", user);
    } catch (e) {
      next(e);
    }
  };
}
