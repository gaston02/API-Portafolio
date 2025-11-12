import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost/portafolio");
    console.log("DB connected");
  } catch (error) {
    console.log(error);
  }
};
