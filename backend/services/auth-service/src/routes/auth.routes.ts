import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { requireUser } from "../middleware/internalAuth.middleware.js";
import { imageUpload } from "../middleware/upload.middleware.js";

export const authRouter = Router();
const controller = new AuthController();

authRouter.post("/register", imageUpload.single("avatar"), controller.register);
authRouter.post("/login", controller.login);
authRouter.post("/refresh", controller.refresh);
authRouter.post("/logout", controller.logout);
authRouter.get("/me", requireUser, controller.me);
authRouter.patch("/profile", requireUser, controller.updateProfile);
authRouter.patch("/avatar", requireUser, imageUpload.single("avatar"), controller.updateAvatar);
