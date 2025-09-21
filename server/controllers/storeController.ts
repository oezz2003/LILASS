import { Request, Response } from "express";
import { Product } from "../models/Product";

function toClientShape(p: any) {
  const v = p.variants?.[0];
  return {
    id: String(p._id),
    name: p.title,
    category: p.categories?.[0] ?? "",
    unit: v?.attributes?.get?.("unit") ?? "",
    size: v?.title ?? "",
    price: v?.price ?? 0,
    sku: v?.sku ?? "",
    stock: v?.stock ?? 0,
    imageUrl: (v?.images?.[0] ?? p.images?.[0]) ?? "",
    description: p.description ?? "",
    addedAt: p.createdAt,
  };
}

export async function listStoreProducts(_req: Request, res: Response) {
  try {
    const docs = await Product.find({}).sort({ createdAt: 1 });
    return res.json({ products: docs.map(toClientShape) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to list products" });
  }
}

export async function createStoreProduct(req: Request, res: Response) {
  try {
    const { name, category, unit, size, price, sku, stock, imageUrl, description } = req.body as any;
    if (!name || !category || price == null || !sku) return res.status(400).json({ message: "Missing fields" });
    const slugBase = String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${slugBase}-${Math.random().toString(36).slice(2, 6)}`;
    const doc = await Product.create({
      title: name,
      description: description ?? "",
      slug,
      images: imageUrl ? [imageUrl] : [],
      categories: [category],
      variants: [
        {
          sku,
          title: size ?? "",
          price: Number(price),
          cost: 0,
          stock: Number(stock ?? 0),
          images: imageUrl ? [imageUrl] : [],
          attributes: unit ? new Map([["unit", unit]]) : undefined,
        },
      ],
    });
    return res.status(201).json({ product: toClientShape(doc) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create product" });
  }
}

export async function updateStoreProduct(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const { name, category, unit, size, price, sku, stock, imageUrl, description } = req.body as any;
    const doc: any = await Product.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    if (name != null) doc.title = name;
    if (description != null) doc.description = description;
    if (category != null) doc.categories = [category];
    if (imageUrl) doc.images = [imageUrl];
    const v = doc.variants?.[0];
    if (v) {
      if (sku != null) v.sku = sku;
      if (size != null) v.title = size;
      if (price != null) v.price = Number(price);
      if (stock != null) v.stock = Number(stock);
      if (imageUrl) v.images = [imageUrl];
      if (unit != null) {
        v.attributes = v.attributes || new Map();
        v.attributes.set("unit", unit);
      }
    }
    await doc.save();
    return res.json({ product: toClientShape(doc) });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update product" });
  }
}

export async function deleteStoreProduct(req: Request, res: Response) {
  try {
    const id = req.params.id;
    await Product.findByIdAndDelete(id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete product" });
  }
}


