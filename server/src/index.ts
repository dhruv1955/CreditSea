import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import borrowerRoutes from "./routes/borrower";
import executiveRoutes from "./routes/executive";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ success: true, message: "LMS server healthy" });
});

app.use("/api/auth", authRoutes);
app.use("/api/borrower", borrowerRoutes);
app.use("/api/executive", executiveRoutes);

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error.message.includes("Only PDF, JPG, PNG files are allowed")) {
    return res.status(400).json({ success: false, message: error.message });
  }
  if (error.message.toLowerCase().includes("file too large")) {
    return res.status(400).json({ success: false, message: "File exceeds max size of 5MB" });
  }
  return res.status(500).json({ success: false, message: "Internal server error" });
});

const start = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required");
    }
    if (process.env.NODE_ENV === "production" && !process.env.CLIENT_URL) {
      throw new Error("CLIENT_URL is required in production");
    }

    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
};

void start();
