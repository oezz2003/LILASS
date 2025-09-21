import mongoose, { Schema, InferSchemaType, Model, Types } from "mongoose";

const PaymentSchema = new Schema(
  {
    provider: { type: String, enum: ["stripe", "paypal", "manual"], required: true },
    status: { type: String, enum: ["created", "succeeded", "failed"], default: "created", index: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "usd" },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    externalId: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export type PaymentDocument = InferSchemaType<typeof PaymentSchema> & { _id: Types.ObjectId };

export const Payment: Model<PaymentDocument> =
  mongoose.models.Payment || mongoose.model<PaymentDocument>("Payment", PaymentSchema);



