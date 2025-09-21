import { Request, Response } from "express";
import { Product } from "../models/Product";

export async function getAllProducts(_req: Request, res: Response) {
  try {
    const { search, category, min, max, featured, tags, page = 1, pageSize = 24, sort } = _req.query as any;
    const filter: any = { active: true };
    if (search) filter.$text = { $search: String(search) };
    if (category) filter.categories = { $in: [String(category)] };
    if (featured != null) filter.featured = featured === "true";
    if (tags) filter.tags = { $in: String(tags).split(",") };
    if (min || max) filter["variants.price"] = { ...(min ? { $gte: Number(min) } : {}), ...(max ? { $lte: Number(max) } : {}) };
    const skip = (Number(page) - 1) * Number(pageSize);
    const sortSpec: Record<string, 1 | -1> = sort === "price_asc" ? { "variants.price": 1 } : sort === "price_desc" ? { "variants.price": -1 } : { createdAt: -1 };
    const products = await Product.find(filter).sort(sortSpec).skip(skip).limit(Number(pageSize)).lean();
    return res.json({ products });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch products" });
  }
}

export async function getProductBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug, active: true }).lean();
    if (!product) return res.status(404).json({ message: "Not found" });
    return res.json({ product });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch product" });
  }
}

export async function getRelatedProducts(req: Request, res: Response) {
  try {
    const { productId } = req.query as any;
    const base = await Product.findById(productId).lean();
    if (!base) return res.json({ products: [] });
    const products = await Product.find({
      _id: { $ne: base._id },
      active: true,
      $or: [
        { categories: { $in: base.categories || [] } },
        { tags: { $in: base.tags || [] } },
      ],
    })
      .limit(8)
      .lean();
    return res.json({ products });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch related" });
  }
}



