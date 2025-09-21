import mongoose, { Schema, InferSchemaType, Model, Types } from "mongoose";

const CustomerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, index: true },
    gender: { type: String, enum: ["Male", "Female"], required: false },
    ageGroup: { type: String }, // e.g., 20-25
    email: { type: String, lowercase: true },
  },
  { timestamps: true }
);

export type CustomerDocument = InferSchemaType<typeof CustomerSchema> & { _id: Types.ObjectId };

export const Customer: Model<CustomerDocument> =
  mongoose.models.Customer || mongoose.model<CustomerDocument>("Customer", CustomerSchema);


