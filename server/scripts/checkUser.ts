import dotenv from "dotenv";
import { connectDB } from "../src/config/db";
import { User } from "../src/models/User";

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    const user = await User.findOne({ email: "borrower@lms.com" }).lean();
    if (!user) {
      console.log("User not found");
    } else {
      console.log("Found user:", { email: user.email, passwordHash: user.password, role: user.role });
    }
  } catch (err) {
    console.error("Error checking user", err);
  } finally {
    process.exit(0);
  }
};

void run();
