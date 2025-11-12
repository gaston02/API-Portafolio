import mongoose from "mongoose";

const templateSchema = new mongoose.Schema(
  {
    path: {
      type: String,
      required: false,
      unique: false,
      trim: true,
      sparse: true,
    },
    link: {
      type: String,
      required: true,
      unique: true,
      trim: true,
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
        es: { type: String, trim: true },
        en: { type: String, trim: true },
      },
    ],
    basePriceCLP: {
      type: Number,
      required: false,
      default: 0,
    },
    downloadPath: {
        type: String,
        required: false,
        unique: true,
        trim: true,
        sparse: true
    },
    status: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Template", templateSchema);
