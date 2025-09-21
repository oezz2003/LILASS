import { Request, Response } from "express";
import { startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, startOfWeek, eachDayOfInterval, endOfWeek } from "date-fns";
import { Invoice } from "../models/Invoice";
import { CostEntry } from "../models/CostEntry";

function parseWindow(q: any) {
  const now = new Date();
  const scale = (q.scale as string) || "monthly";
  const year = q.year ? Number(q.year) : now.getFullYear();
  const quarter = q.quarter ? Number(q.quarter) : Math.floor(now.getMonth() / 3) + 1;
  const month = q.month ? Number(q.month) : now.getMonth() + 1; // 1..12
  const week = q.week ? Number(q.week) : 0;

  if (scale === "yearly") {
    const s = startOfYear(new Date(year, 0, 1));
    const e = endOfYear(s);
    return { scale, year, quarter, month, week, start: s, end: e };
  }
  if (scale === "quarterly") {
    const m0 = (quarter - 1) * 3;
    const s = startOfMonth(new Date(year, m0, 1));
    const e = endOfMonth(new Date(year, m0 + 2, 1));
    return { scale, year, quarter, month, week, start: s, end: e };
  }
  if (scale === "weekly" || scale === "daily") {
    const baseMonth = startOfMonth(new Date(year, month - 1, 1));
    if (week === 0) {
      return { scale, year, quarter, month, week, start: baseMonth, end: endOfMonth(baseMonth) };
    }
    const base = startOfWeek(baseMonth, { weekStartsOn: 1 });
    const s = addDays(base, (week - 1) * 7);
    const e = endOfWeek(s, { weekStartsOn: 1 });
    return { scale, year, quarter, month, week, start: s, end: e };
  }
  // monthly
  const s = startOfMonth(new Date(year, month - 1, 1));
  return { scale, year, quarter, month, week, start: s, end: endOfMonth(s) };
}

export async function listInvoices(req: Request, res: Response) {
  try {
    const w = parseWindow(req.query);
    const invoices = await Invoice.find({ date: { $gte: w.start, $lte: w.end } }).lean();
    return res.json({ invoices });
  } catch (err) {
    return res.status(500).json({ message: "Failed to list invoices" });
  }
}

export async function summaryInvoices(req: Request, res: Response) {
  try {
    const w = parseWindow(req.query);
    const invoices = await Invoice.find({ date: { $gte: w.start, $lte: w.end } }).lean();
    const subtotal = invoices.reduce((a, b) => a + (b.subtotal || 0), 0);
    const paid = invoices.reduce((a, b) => a + (b.paid || 0), 0);
    const balance = Math.max(0, subtotal - paid);
    // Build buckets based on scale
    let buckets: { label: string; total: number }[] = [];
    if (w.scale === "yearly") {
      buckets = Array.from({ length: 12 }, (_, i) => ({ label: new Date(2000, i, 1).toLocaleString("en", { month: "short" }), total: 0 }));
      invoices.forEach((inv) => { buckets[new Date(inv.date).getMonth()].total += inv.subtotal || 0; });
    } else if (w.scale === "quarterly") {
      buckets = ["Q1","Q2","Q3","Q4"].map((l) => ({ label: l, total: 0 }));
      invoices.forEach((inv) => { const q = Math.floor(new Date(inv.date).getMonth() / 3); buckets[q].total += inv.subtotal || 0; });
    } else if (w.scale === "monthly") {
      const days = eachDayOfInterval({ start: w.start, end: w.end });
      buckets = days.map((d) => ({ label: String(d.getDate()), total: 0 }));
      invoices.forEach((inv) => { const idx = new Date(inv.date).getDate() - 1; if (idx >= 0 && idx < buckets.length) buckets[idx].total += inv.subtotal || 0; });
    } else if (w.week === 0) { // weekly/daily with all weeks
      buckets = [1,2,3,4].map((i) => ({ label: `Wk ${i}`, total: 0 }));
      const base = startOfWeek(startOfMonth(new Date(w.year, w.month - 1, 1)), { weekStartsOn: 1 });
      invoices.forEach((inv) => { const diff = Math.floor((new Date(inv.date).getTime() - base.getTime()) / 86400000); const wk = Math.floor(diff / 7) + 1; const idx = Math.min(Math.max(wk, 1), 4) - 1; buckets[idx].total += inv.subtotal || 0; });
    } else {
      const days = eachDayOfInterval({ start: w.start, end: w.end });
      buckets = days.map((d) => ({ label: d.toLocaleString("en", { weekday: "short" }), total: 0 }));
      invoices.forEach((inv) => { const idx = Math.floor((new Date(inv.date).getTime() - w.start.getTime()) / 86400000); if (idx >= 0 && idx < buckets.length) buckets[idx].total += inv.subtotal || 0; });
    }
    return res.json({ totals: { subtotal, paid, balance }, buckets });
  } catch (err) {
    return res.status(500).json({ message: "Failed to summarize invoices" });
  }
}

export async function listCosts(req: Request, res: Response) {
  try {
    const w = parseWindow(req.query);
    const section = (req.query.section as string) || "cogs";
    const entries = await CostEntry.find({ section, date: { $gte: w.start, $lte: w.end } }).lean();
    // buckets
    let buckets: { label: string; total: number }[] = [];
    if (w.scale === "yearly") {
      buckets = Array.from({ length: 12 }, (_, i) => ({ label: new Date(2000, i, 1).toLocaleString("en", { month: "short" }), total: 0 }));
      entries.forEach((en) => { buckets[new Date(en.date).getMonth()].total += en.amount || 0; });
    } else if (w.scale === "quarterly") {
      buckets = ["Q1","Q2","Q3","Q4"].map((l) => ({ label: l, total: 0 }));
      entries.forEach((en) => { const q = Math.floor(new Date(en.date).getMonth() / 3); buckets[q].total += en.amount || 0; });
    } else if (w.scale === "monthly") {
      const days = eachDayOfInterval({ start: w.start, end: w.end });
      buckets = days.map((d) => ({ label: String(d.getDate()), total: 0 }));
      entries.forEach((en) => { const idx = new Date(en.date).getDate() - 1; if (idx >= 0 && idx < buckets.length) buckets[idx].total += en.amount || 0; });
    } else if (w.week === 0) {
      buckets = [1,2,3,4].map((i) => ({ label: `Wk ${i}`, total: 0 }));
      const base = startOfWeek(startOfMonth(new Date(w.year, w.month - 1, 1)), { weekStartsOn: 1 });
      entries.forEach((en) => { const diff = Math.floor((new Date(en.date).getTime() - base.getTime()) / 86400000); const wk = Math.floor(diff / 7) + 1; const idx = Math.min(Math.max(wk, 1), 4) - 1; buckets[idx].total += en.amount || 0; });
    } else {
      const days = eachDayOfInterval({ start: w.start, end: w.end });
      buckets = days.map((d) => ({ label: d.toLocaleString("en", { weekday: "short" }), total: 0 }));
      entries.forEach((en) => { const idx = Math.floor((new Date(en.date).getTime() - w.start.getTime()) / 86400000); if (idx >= 0 && idx < buckets.length) buckets[idx].total += en.amount || 0; });
    }
    const total = entries.reduce((a, b) => a + (b.amount || 0), 0);
    return res.json({ entries, buckets, total });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch costs" });
  }
}

export async function createCost(req: Request, res: Response) {
  try {
    const { section, date, amount, note } = req.body as { section: string; date: string; amount: number; note?: string };
    if (!section || !date || !amount) return res.status(400).json({ message: "Invalid payload" });
    const entry = await CostEntry.create({ section, date: new Date(date), amount, note });
    return res.status(201).json({ entry });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create cost entry" });
  }
}

export async function deleteCost(req: Request, res: Response) {
  try {
    const id = req.params.id;
    await CostEntry.findByIdAndDelete(id);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete cost entry" });
  }
}


