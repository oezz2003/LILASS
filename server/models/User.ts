import mongoose, { Schema, InferSchemaType, Model } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "staff", "customer"], default: "customer" },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  const user = this as any;
  if (!user.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export type UserDocument = InferSchemaType<typeof UserSchema> & {
  comparePassword(candidate: string): Promise<boolean>;
};

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);



