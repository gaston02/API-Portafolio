import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: {
      type: String,
      required: false,
      trim: true,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["root", "owner", "admin"],
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
