import mongoose, { Schema, InferSchemaType, Model, Types } from "mongoose";

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1 },
    product: { type: Schema.Types.Mixed }, // Store full product data
    variant: { type: Schema.Types.Mixed }, // Store full variant data
  },
  { _id: false }
);

const AddressSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: String,
    address1: { type: String, required: true },
    address2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: String,
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    customerEmail: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0, default: 0 },
    tax: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0 },
    shippingAddress: AddressSchema,
    billingAddress: AddressSchema,
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
  },
  { timestamps: true }
);

export type OrderDocument = InferSchemaType<typeof OrderSchema> & { _id: Types.ObjectId };

export const Order: Model<OrderDocument> =
  mongoose.models.Order || mongoose.model<OrderDocument>("Order", OrderSchema);



