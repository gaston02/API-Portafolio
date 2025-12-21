import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: false,
      unique: true,
      trim: true,
      sparse: true,
    },
    link: {
      type: String,
      required: false,
      unique: true,
      trim: true,
      sparse: true,
    },
    linkHub: {
      type: String,
      required: false,
      unique: true,
      trim: true,
      sparse: true,
    },
    title: {
      es: {
        type: String,
        required: true,
        trim: true,
      },
      en: {
        type: String,
        required: true,
        trim: true,
      },
    },
    description: {
      es: {
        type: String,
        required: true,
        trim: true,
      },
      en: {
        type: String,
        required: true,
        trim: true,
      },
    },
    highlights: [
      {
        es: { type: String, required: true, trim: true },
        en: { type: String, required: true, trim: true },
      },
    ],
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
