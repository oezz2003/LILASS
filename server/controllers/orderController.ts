import { Request, Response } from "express";
import { Order } from "../models/Order";
import { Product } from "../models/Product";
import mongoose from "mongoose";
import { StockItem } from "../models/StockItem";
import { AuthRequest } from "../middleware/auth";

export async function createOrder(req: Request, res: Response) {
  try {
    const { items, customerEmail, shippingAddress, billingAddress } = req.body;
    if (!Array.isArray(items) || items.length === 0 || !customerEmail) {
      return res.status(400).json({ message: "Invalid order payload" });
    }

    // Build order line items from product/variant data to avoid client tampering
    let subtotal = 0;
    const builtItems = [] as any[];

    // Use transaction to ensure stock deduction and order creation are atomic
    const session = await mongoose.startSession();
    await session.withTransaction(async () => {
      for (const item of items) {
        const { productId, variantId, quantity } = item;
        const product = await Product.findById(productId).session(session);
        if (!product) throw new Error("Product not found");
        const variant: any = product.variants.id(variantId);
        if (!variant) throw new Error("Variant not found");
        if (variant.stock < quantity) throw new Error("Insufficient stock");

        // Check ingredient availability based on recipe
        if (Array.isArray(variant.recipe) && variant.recipe.length > 0) {
          for (const comp of variant.recipe) {
            const need = comp.amount * quantity;
            const ing = await StockItem.findById(comp.ingredientId).session(session);
            if (!ing) throw new Error("Ingredient not found");
            if (ing.quantity < need) throw new Error(`Insufficient ingredient: ${ing.name}`);
          }
          // Deduct ingredients
          for (const comp of variant.recipe) {
            const need = comp.amount * quantity;
            await StockItem.updateOne(
              { _id: comp.ingredientId },
              { $inc: { quantity: -need } },
              { session }
            );
          }
        }

        const lineTotal = variant.price * quantity;
        subtotal += lineTotal;
        builtItems.push({
          productId: product._id,
          variantId: variant._id,
          product: product,  // Include full product for frontend
          variant: variant,  // Include full variant for frontend
          quantity,
        });
        // decrement sellable variant stock
        variant.stock -= quantity;
        await product.save({ session });
      }
    });

    const tax = Math.round(subtotal * 0.085 * 100) / 100; // 8.5% tax
    const shipping = subtotal >= 50 ? 0 : 5.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    const order = await Order.create({
      customerEmail,
      items: builtItems,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      billingAddress,
      status: 'pending'
    });

    return res.status(201).json({ order });
  } catch (err: any) {
    console.error('Order creation error:', err);
    return res.status(500).json({ message: err.message || "Failed to create order" });
  }
}

export async function getOrder(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).lean();
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.json({ order });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch order" });
  }
}

export async function getMyOrders(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();
    
    return res.json({ orders });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
}


