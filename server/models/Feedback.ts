import mongoose, { Schema, InferSchemaType, Model, Types } from "mongoose";

const FeedbackSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
    type: { type: String, enum: ["Quality", "Service", "Delivery", "Price", "Other"], required: true },
    description: { type: String, required: true },
    createdAt: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: true }
);

export type FeedbackDocument = InferSchemaType<typeof FeedbackSchema> & { _id: Types.ObjectId };

export const Feedback: Model<FeedbackDocument> =
  mongoose.models.Feedback || mongoose.model<FeedbackDocument>("Feedback", FeedbackSchema);


