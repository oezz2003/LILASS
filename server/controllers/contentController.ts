import { Request, Response } from "express";
import { Product } from "../models/Product";

export async function getHomeContent(_req: Request, res: Response) {
  try {
    const featured = await Product.find({ active: true, featured: true }).limit(8).lean();
    return res.json({
      hero: {
        title: "Brewed to Perfection",
        subtitle: "Discover our seasonal roasts and signature drinks",
        cta: { label: "Shop now", href: "/store/products" },
        image: "/images/hero-coffee.jpg",
      },
      highlights: [
        { title: "Free Shipping", description: "On orders over $50" },
        { title: "Secure Checkout", description: "Powered by Stripe" },
        { title: "Quality Beans", description: "Sourced responsibly" },
      ],
      featuredProducts: featured,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load home content" });
  }
}

export async function getPageContent(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug || "");
    if (slug === "about") {
      return res.json({
        title: "About Us",
        content: "We are passionate about coffee and craftsmanship.",
      });
    }
    if (slug === "contact") {
      return res.json({
        title: "Contact Us",
        content: "Email us at support@example.com or call +1 555-123-4567.",
      });
    }
    return res.status(404).json({ message: "Page not found" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load page" });
  }
}


