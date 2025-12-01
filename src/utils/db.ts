import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI as string;

    if (!uri) {
      return;
    }

    await mongoose.connect(uri);
  } catch (error) {
  }
};
