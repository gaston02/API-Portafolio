import mongoose from "mongoose";
import { DB_URI } from "./config.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI);
    console.log("DB connected");
  } catch (error) {
    console.log(error);
  }
};
