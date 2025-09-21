import mongoose, { Schema, InferSchemaType, Model, Types } from "mongoose";

const InvoiceItemSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema(
  {
    date: { type: Date, required: true, index: true },
    time: { type: String },
    customerName: { type: String },
    phone: { type: String },
    gender: { type: String, enum: ["Male", "Female"], required: false },
    items: { type: [InvoiceItemSchema], default: [] },
    subtotal: { type: Number, required: true, min: 0 },
    paid: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export type InvoiceDocument = InferSchemaType<typeof InvoiceSchema> & { _id: Types.ObjectId };

export const Invoice: Model<InvoiceDocument> =
  mongoose.models.Invoice || mongoose.model<InvoiceDocument>("Invoice", InvoiceSchema);


