import mongoose, { Schema, InferSchemaType, Model, Types } from "mongoose";

const StockItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    sku: { type: String, trim: true, unique: true },
    unit: { type: String, required: true }, // e.g., g, ml, piece
    quantity: { type: Number, required: true, min: 0 }, // current on-hand
    reorderLevel: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type StockItemDocument = InferSchemaType<typeof StockItemSchema> & { _id: Types.ObjectId };

export const StockItem: Model<StockItemDocument> =
  mongoose.models.StockItem || mongoose.model<StockItemDocument>("StockItem", StockItemSchema);



