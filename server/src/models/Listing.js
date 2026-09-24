import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      enum: ["electronics", "furniture", "books", "clothing", "other"],
      required: true,
    },

    condition: {
      type: String,
      enum: ["new", "like-new", "good", "fair", "poor"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "sold", "removed"],
      default: "active",
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const Listing = mongoose.model("Listing", listingSchema);
