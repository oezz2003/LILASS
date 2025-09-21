import mongoose, { Schema, InferSchemaType, Model, Types } from "mongoose";

const CostEntrySchema = new Schema(
  {
    section: { type: String, enum: ["cogs", "tech", "variable"], required: true, index: true },
    date: { type: Date, required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    note: { type: String },
  },
  { timestamps: true }
);

export type CostEntryDocument = InferSchemaType<typeof CostEntrySchema> & { _id: Types.ObjectId };

export const CostEntry: Model<CostEntryDocument> =
  mongoose.models.CostEntry || mongoose.model<CostEntryDocument>("CostEntry", CostEntrySchema);


