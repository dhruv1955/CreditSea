import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiErrorResponse, AuthenticatedRequest, JwtPayload } from "../types";

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response<ApiErrorResponse>,
  next: NextFunction
): Response<ApiErrorResponse> | void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Missing or invalid authorization token" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
