import { NextFunction, Response } from "express";
import { ApiErrorResponse, AuthenticatedRequest, Role } from "../types";

export const authorize = (allowedRoles: Role[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response<ApiErrorResponse>,
    next: NextFunction
  ): Response<ApiErrorResponse> | void => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (req.user.role === "admin") {
      next();
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    next();
  };
};
