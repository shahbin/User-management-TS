import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI as string;

    if (!uri) {
      console.error("Mongo URI missing in .env");
      return;
    }

    await mongoose.connect(uri);
    console.log("✔ MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
};
