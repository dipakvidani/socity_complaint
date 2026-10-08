import { Response } from "express";

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse {
  static success<T>(res: Response, message: string, data: T | null = null, meta: Meta | null = null, status = 200) {
    return res.status(status).json({ success: true, message, data, meta });
  }

  static error(res: Response, status: number, message: string, errors: Record<string, string> | null = null) {
    return res.status(status).json({ success: false, message, data: null, meta: errors ? { errors } : null });
  }
}
