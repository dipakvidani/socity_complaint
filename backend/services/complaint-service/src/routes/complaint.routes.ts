import { Router } from "express";
import { ComplaintController } from "../controllers/complaint.controller.js";
import { requireAdmin, requireUser } from "../middleware/internalAuth.middleware.js";
import { imageUpload } from "../middleware/upload.middleware.js";

export const complaintRouter = Router();
const controller = new ComplaintController();

complaintRouter.use(requireUser);
complaintRouter.get("/", controller.list);
complaintRouter.post("/", imageUpload.single("image"), controller.create);
complaintRouter.get("/:id", controller.detail);
complaintRouter.post("/:id/comments", controller.addComment);
complaintRouter.patch("/:id/cancel", controller.cancel);
complaintRouter.patch("/:id/status", requireAdmin, controller.changeStatus);
