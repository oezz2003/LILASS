import { Request, Response } from "express";
import { StockItem } from "../models/StockItem";
import { Product } from "../models/Product";
import mongoose from "mongoose";

export async function getLowStock(req: Request, res: Response) {
  try {
    const threshold = req.query.threshold ? Number(req.query.threshold) : undefined;
    const query = threshold != null ? { $expr: { $lte: ["$quantity", threshold] } } : { $expr: { $lte: ["$quantity", "$reorderLevel"] } };
    const items = await StockItem.find(query).select("name quantity reorderLevel").lean();
    return res.json({ lowCount: items.length, items });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch low stock" });
  }
}

export async function getProductsCoverage(_req: Request, res: Response) {
  try {
    const products = await Product.find({ active: true }).lean();
    const items = await StockItem.find({}).lean();
    const stockMap = new Map(items.map((i) => [i._id.toString(), i]));
    const result = products.map((p: any) => {
      const cover = (p.variants || []).reduce((min: number, v: any) => {
        if (!v.recipe || v.recipe.length === 0) return Math.min(min, v.stock || 0);
        const limits = v.recipe.map((r: any) => {
          const ing = stockMap.get(r.ingredientId.toString());
          if (!ing) return 0;
          if (r.amount === 0) return Infinity;
          return Math.floor(ing.quantity / r.amount);
        });
        const vCover = Math.max(0, Math.min(...limits));
        return Math.min(min, vCover);
      }, Number.POSITIVE_INFINITY);
      const coverage = Number.isFinite(cover) ? cover : 0;
      return {
        id: p._id,
        name: p.title,
        category: (p.categories?.[0] as string) || "General",
        coverage,
        status: coverage > 0 ? "in" : "out",
      };
    });
    return res.json({ products: result });
  } catch (err) {
    return res.status(500).json({ message: "Failed to compute coverage" });
  }
}

export async function getProductRecipe(req: Request, res: Response) {
  try {
    const productId = req.params.id;
    const variantId = (req.query.variantId as string) || undefined;
    const product: any = await Product.findById(productId).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    const variant = variantId ? product.variants?.find((v: any) => v._id.toString() === variantId) : product.variants?.[0];
    if (!variant) return res.status(404).json({ message: "Variant not found" });
    const ingIds = (variant.recipe || []).map((r: any) => r.ingredientId);
    const stockItems = await StockItem.find({ _id: { $in: ingIds } }).lean();
    const stockMap = new Map(stockItems.map((i) => [i._id.toString(), i]));
    const recipe = (variant.recipe || []).map((r: any) => {
      const si: any = stockMap.get(r.ingredientId.toString());
      return {
        ingredientId: r.ingredientId,
        name: si?.name ?? "Unknown",
        unit: si?.unit ?? "",
        amountPerUnit: r.amount,
        inStock: si?.quantity ?? 0,
        missing: Math.max(0, r.amount - (si?.quantity ?? 0)),
      };
    });
    return res.json({ productId, variantId: variant?._id, recipe });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch recipe" });
  }
}

export async function getForecast(req: Request, res: Response) {
  try {
    const horizon = (req.query.horizon as string) || "1d";
    const products = await Product.find({ active: true }).lean();
    // naive: use variant stock as proxy for popularity
    const forecast = products.map((p: any) => ({
      id: p._id,
      name: p.title,
      forecastUnits: Math.max(20, Math.min(300, (p.variants?.[0]?.stock ?? 100) + (horizon === "7d" ? 80 : 0))),
    }));
    return res.json({ products: forecast });
  } catch (err) {
    return res.status(500).json({ message: "Failed to forecast" });
  }
}

export async function reorderStock(req: Request, res: Response) {
  try {
    const { ingredientId, quantity } = req.body as { ingredientId: string; quantity: number };
    if (!ingredientId || !quantity || quantity <= 0) return res.status(400).json({ message: "Invalid reorder payload" });
    const updated = await StockItem.findByIdAndUpdate(
      ingredientId,
      { $inc: { quantity } },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: "Ingredient not found" });
    return res.json({ item: { id: updated._id, quantity: updated.quantity } });
  } catch (err) {
    return res.status(500).json({ message: "Failed to reorder" });
  }
}

export async function adjustStock(req: Request, res: Response) {
  try {
    const { ingredientId, delta } = req.body as { ingredientId: string; delta: number };
    if (!ingredientId || typeof delta !== "number") return res.status(400).json({ message: "Invalid adjust payload" });
    const updated = await StockItem.findByIdAndUpdate(
      ingredientId,
      { $inc: { quantity: delta } },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: "Ingredient not found" });
    return res.json({ item: { id: updated._id, quantity: updated.quantity } });
  } catch (err) {
    return res.status(500).json({ message: "Failed to adjust stock" });
  }
}

export async function setReorderLevel(req: Request, res: Response) {
  try {
    const { ingredientId, reorderLevel } = req.body as { ingredientId: string; reorderLevel: number };
    if (!ingredientId || reorderLevel == null || reorderLevel < 0) return res.status(400).json({ message: "Invalid payload" });
    const updated = await StockItem.findByIdAndUpdate(
      ingredientId,
      { $set: { reorderLevel } },
      { new: true }
    ).lean();
    if (!updated) return res.status(404).json({ message: "Ingredient not found" });
    return res.json({ item: { id: updated._id, reorderLevel: updated.reorderLevel } });
  } catch (err) {
    return res.status(500).json({ message: "Failed to set reorder level" });
  }
}


