import { Request, Response } from "express";
import { Feedback } from "../models/Feedback";
import { Customer } from "../models/Customer";

export async function listFeedback(req: Request, res: Response) {
  try {
    const { start, end, type, q } = req.query as any;
    const filter: any = {};
    if (type && type !== "All") filter.type = type;
    if (start || end) filter.createdAt = { ...(start ? { $gte: new Date(start) } : {}), ...(end ? { $lte: new Date(end) } : {}) };
    if (q) filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
    ];
    const rows = await Feedback.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ feedback: rows });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch feedback" });
  }
}

export async function createFeedback(req: Request, res: Response) {
  try {
    const { name, phone, type, description } = req.body as any;
    if (!name || !type || !description) return res.status(400).json({ message: "Missing fields" });
    const row = await Feedback.create({ name, phone, type, description });
    return res.status(201).json({ feedback: row });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create feedback" });
  }
}

export async function listCustomers(req: Request, res: Response) {
  try {
    const { q } = req.query as any;
    const filter: any = {};
    if (q) filter.$or = [{ name: { $regex: q, $options: "i" } }, { phone: { $regex: q, $options: "i" } }];
    const rows = await Customer.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ customers: rows });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch customers" });
  }
}


