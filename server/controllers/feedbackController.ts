import { Request, Response } from "express";

// Placeholder: in a real app, fetch from reviews collection or external CSAT
export async function getFeedbackSummary(req: Request, res: Response) {
  try {
    // naive synthetic rates depending on query for now
    const scale = (req.query.scale as string) || "weekly";
    const base = scale === "yearly" ? 82 : scale === "monthly" ? 78 : 74;
    const positiveRate = Math.min(98, Math.max(5, Math.round(base)));
    const negativeRate = 100 - positiveRate;
    return res.json({ positiveRate, negativeRate });
  } catch (err) {
    return res.status(500).json({ message: "Failed to get feedback summary" });
  }
}


