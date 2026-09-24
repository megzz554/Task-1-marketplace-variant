import Joi from "joi";
import mongoose from "mongoose";
import { Listing } from "../models/Listing.js";

// Validation for creating a listing
const createSchema = Joi.object({
  title: Joi.string().min(3).max(120).required(),

  description: Joi.string().max(2000).allow("", null),

  price: Joi.number().min(0).required(),

  category: Joi.string()
    .valid("electronics", "furniture", "books", "clothing", "other")
    .required(),

  condition: Joi.string()
    .valid("new", "like-new", "good", "fair", "poor")
    .required(),

  seller: Joi.string().required(),
});

// Validation for updating a listing
const updateSchema = Joi.object({
  title: Joi.string().min(3).max(120),

  description: Joi.string().max(2000).allow("", null),

  price: Joi.number().min(0),

  category: Joi.string().valid(
    "electronics",
    "furniture",
    "books",
    "clothing",
    "other",
  ),

  condition: Joi.string().valid("new", "like-new", "good", "fair", "poor"),

  seller: Joi.string(),
});

// GET /api/listings
export async function getAllListings(req, res, next) {
  try {
    const listings = await Listing.find({
      status: { $ne: "removed" },
    })
      .populate("seller", "name email")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ listings });
  } catch (err) {
    next(err);
  }
}

// GET /api/listings/:id
export async function getListing(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid listing ID",
      });
    }

    const listing = await Listing.findById(id).populate("seller", "name email");

    if (!listing || listing.status === "removed") {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.json({ listing });
  } catch (err) {
    next(err);
  }
}

// POST /api/listings
export async function createListing(req, res, next) {
  try {
    const { value, error } = createSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (!mongoose.isValidObjectId(value.seller)) {
      return res.status(400).json({
        message: "Invalid seller ID",
      });
    }

    const listing = await Listing.create(value);

    res.status(201).json({ listing });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/listings/:id
export async function updateListing(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid listing ID",
      });
    }

    const { value, error } = updateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (value.seller && !mongoose.isValidObjectId(value.seller)) {
      return res.status(400).json({
        message: "Invalid seller ID",
      });
    }

    const listing = await Listing.findByIdAndUpdate(
      id,
      { $set: value },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!listing || listing.status === "removed") {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.json({ listing });
  } catch (err) {
    next(err);
  }
}
// PATCH /api/listings/:id/sold
export async function markListingSold(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid listing ID",
      });
    }

    const listing = await Listing.findByIdAndUpdate(
      id,
      { $set: { status: "sold" } },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!listing || listing.status === "removed") {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    res.json({ listing });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/listings/:id
export async function deleteListing(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid listing ID",
      });
    }

    const listing = await Listing.findById(id);

    if (!listing || listing.status === "removed") {
      return res.status(404).json({
        message: "Listing not found",
      });
    }

    // Soft delete
    listing.status = "removed";

    await listing.save();

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
