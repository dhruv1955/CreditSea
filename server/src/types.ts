import { Request } from "express";

export type Role =
  | "borrower"
  | "sales"
  | "sanction"
  | "disbursement"
  | "collection"
  | "admin";

export interface JwtPayload {
  userId: string;
  role: Role;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}
