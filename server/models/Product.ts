import mongoose, { Schema, InferSchemaType, Model, Types } from "mongoose";

const VariantSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    cost: { type: Number, required: true, min: 0, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    attributes: { type: Map, of: String }, // e.g., color=size
    images: [{ type: String }],
    active: { type: Boolean, default: true },
    // Recipe: list of ingredients (StockItem) with amount required per 1 unit of this variant
    recipe: [
      new Schema(
        {
          ingredientId: { type: Schema.Types.ObjectId, ref: "StockItem", required: true },
          amount: { type: Number, required: true, min: 0 },
        },
        { _id: false }
      ),
    ],
  },
  { _id: true, timestamps: true }
);

const ProductSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    slug: { type: String, required: true, unique: true, index: true },
    images: [{ type: String }],
    categories: [{ type: String, index: true }],
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
    variants: [VariantSchema],
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type VariantDocument = InferSchemaType<typeof VariantSchema> & { _id: Types.ObjectId };
export type ProductDocument = InferSchemaType<typeof ProductSchema> & { _id: Types.ObjectId };

export const Product: Model<ProductDocument> =
  mongoose.models.Product || mongoose.model<ProductDocument>("Product", ProductSchema);


