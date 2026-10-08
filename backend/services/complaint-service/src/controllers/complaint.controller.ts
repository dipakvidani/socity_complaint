import { NextFunction, Request, Response } from "express";
import { ComplaintService } from "../services/complaint.service.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { AppError } from "../utils/AppError.js";
import { commentSchema, createComplaintSchema, listQuerySchema, statusSchema } from "../utils/validation.js";

const idOf = (req: Request) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) throw new AppError(404, "We could not find that complaint.");
  return id;
};

export class ComplaintController {
  constructor(private service = new ComplaintService()) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createComplaintSchema.parse(req.body);
      const data = await this.service.create(req.caller!, input, req.file?.buffer);
      ApiResponse.success(res, "Your complaint has been sent to the society office.", data, null, 201);
    } catch (e) {
      next(e);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = listQuerySchema.parse(req.query);
      const { items, meta } = await this.service.list(req.caller!, query);
      ApiResponse.success(res, items.length ? "Here are your complaints." : "No complaints match your search yet.", items, meta);
    } catch (e) {
      next(e);
    }
  };

  detail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.detail(req.caller!, idOf(req));
      ApiResponse.success(res, "Complaint details are ready.", data);
    } catch (e) {
      next(e);
    }
  };

  addComment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message } = commentSchema.parse(req.body);
      const data = await this.service.addComment(req.caller!, idOf(req), message);
      ApiResponse.success(res, "Your comment has been added.", data, null, 201);
    } catch (e) {
      next(e);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.cancel(req.caller!, idOf(req));
      ApiResponse.success(res, "Your complaint has been cancelled.", data);
    } catch (e) {
      next(e);
    }
  };

  changeStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = statusSchema.parse(req.body);
      const data = await this.service.changeStatus(idOf(req), status);
      ApiResponse.success(res, "The complaint status has been updated.", data);
    } catch (e) {
      next(e);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input = createComplaintSchema.parse(req.body);
      const data = await this.service.update(req.caller!, idOf(req), input, req.file?.buffer);
      ApiResponse.success(res, "Your complaint has been updated.", data);
    } catch (e) {
      next(e);
    }
  };
}
