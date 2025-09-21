import { Request, Response } from "express";
import { Order } from "../models/Order";
import { getYear, getMonth, startOfMonth, endOfMonth, startOfWeek, addDays } from "date-fns";

type Scale = "yearly" | "quarterly" | "monthly" | "weekly" | "hourly";

function labelFor(date: Date, scale: Scale, idx: number) {
  const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]; 
  if (scale === "yearly") return monthShort[getMonth(date)];
  if (scale === "quarterly") return `Q${idx+1}`;
  if (scale === "monthly") return String(date.getDate());
  if (scale === "weekly") return ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][date.getDay()===0?6:date.getDay()-1];
  return `${date.getHours().toString().padStart(2,"0")}:00`;
}

export async function getOverviewAnalytics(req: Request, res: Response) {
  try {
    const scale = (req.query.scale as Scale) || "weekly";
    const yearQ = req.query.year ? Number(req.query.year) : undefined;
    const quarterQ = req.query.quarter ? Number(req.query.quarter) : undefined;
    const monthQ = req.query.month ? Number(req.query.month) : undefined; // 1-12
    const weekQ = req.query.week ? Number(req.query.week) : undefined; // 0-4
    const intervalStart = req.query.intervalStart ? Number(req.query.intervalStart) : undefined;
    const intervalEnd = req.query.intervalEnd ? Number(req.query.intervalEnd) : undefined;

    // Build time window roughly based on inputs
    const now = new Date();
    const year = yearQ ?? getYear(now);
    const month = (monthQ ?? (getMonth(now) + 1)) - 1;
    const start = startOfMonth(new Date(year, month, 1));
    const end = endOfMonth(start);

    // Query orders in the month window for simplicity (can expand later)
    const orders = await Order.find({ createdAt: { $gte: start, $lte: end } }).lean();

    // Aggregate revenue and profitPercent per bucket
    const buckets: { label: string; revenue: number; profitPercent: number }[] = [];

    // Choose bucketing
    if (scale === "yearly") {
      for (let m = 0; m < 12; m++) {
        const s = startOfMonth(new Date(year, m, 1));
        const e = endOfMonth(s);
        const slice = orders.filter((o) => (o.createdAt as any) >= s && (o.createdAt as any) <= e);
        const revenue = slice.reduce((a, b) => a + (b.total || 0), 0);
        const profitPercent = slice.length ? Math.round((slice.reduce((a, b) => a + (b.subtotal || 0), 0) * 0.2) / Math.max(1, revenue) * 1000) / 10 : 0;
        buckets.push({ label: labelFor(s, scale, m), revenue, profitPercent });
      }
    } else if (scale === "quarterly") {
      for (let q = 0; q < 4; q++) {
        const mStart = q * 3;
        const s = new Date(year, mStart, 1);
        const e = endOfMonth(new Date(year, mStart + 2, 1));
        const slice = orders.filter((o) => (o.createdAt as any) >= s && (o.createdAt as any) <= e);
        const revenue = slice.reduce((a, b) => a + (b.total || 0), 0);
        const profitPercent = slice.length ? Math.round((slice.reduce((a, b) => a + (b.subtotal || 0), 0) * 0.2) / Math.max(1, revenue) * 1000) / 10 : 0;
        buckets.push({ label: labelFor(s, scale, q), revenue, profitPercent });
      }
    } else if (scale === "monthly") {
      for (let d = 0; d < 31; d++) {
        const day = new Date(year, month, d + 1);
        if (day.getMonth() !== month) break;
        const s = day;
        const e = new Date(year, month, d + 1, 23, 59, 59);
        const slice = orders.filter((o) => (o.createdAt as any) >= s && (o.createdAt as any) <= e);
        const revenue = slice.reduce((a, b) => a + (b.total || 0), 0);
        const profitPercent = slice.length ? Math.round((slice.reduce((a, b) => a + (b.subtotal || 0), 0) * 0.2) / Math.max(1, revenue) * 1000) / 10 : 0;
        buckets.push({ label: labelFor(s, scale, d), revenue, profitPercent });
      }
    } else if (scale === "weekly") {
      const base = startOfWeek(start, { weekStartsOn: 1 });
      const chosenWeek = (weekQ ?? 0);
      if (chosenWeek === 0) {
        for (let w = 0; w < 4; w++) {
          const ws = addDays(base, w * 7);
          const we = addDays(ws, 6);
          const slice = orders.filter((o) => (o.createdAt as any) >= ws && (o.createdAt as any) <= we);
          const revenue = slice.reduce((a, b) => a + (b.total || 0), 0);
          const profitPercent = slice.length ? Math.round((slice.reduce((a, b) => a + (b.subtotal || 0), 0) * 0.2) / Math.max(1, revenue) * 1000) / 10 : 0;
          buckets.push({ label: `Wk ${w + 1}`, revenue, profitPercent });
        }
      } else {
        const ws = addDays(base, (chosenWeek - 1) * 7);
        for (let i = 0; i < 7; i++) {
          const s = addDays(ws, i);
          const e = addDays(s, 1);
          const slice = orders.filter((o) => (o.createdAt as any) >= s && (o.createdAt as any) <= e);
          const revenue = slice.reduce((a, b) => a + (b.total || 0), 0);
          const profitPercent = slice.length ? Math.round((slice.reduce((a, b) => a + (b.subtotal || 0), 0) * 0.2) / Math.max(1, revenue) * 1000) / 10 : 0;
          buckets.push({ label: labelFor(s, scale, i), revenue, profitPercent });
        }
      }
    } else {
      // hourly
      const startHour = intervalStart ?? 9;
      const endHour = intervalEnd ?? 12;
      for (let h = startHour; h < endHour; h++) {
        const s = new Date(year, month, 1, h);
        const e = new Date(year, month, 1, h + 1);
        const slice = orders.filter((o) => (o.createdAt as any) >= s && (o.createdAt as any) <= e);
        const revenue = slice.reduce((a, b) => a + (b.total || 0), 0);
        const profitPercent = slice.length ? Math.round((slice.reduce((a, b) => a + (b.subtotal || 0), 0) * 0.2) / Math.max(1, revenue) * 1000) / 10 : 0;
        buckets.push({ label: labelFor(s, scale, h), revenue, profitPercent });
      }
    }

    const totalRevenue = buckets.reduce((a, b) => a + b.revenue, 0);
    const avgProfitPercent = buckets.length
      ? Math.round((buckets.reduce((a, b) => a + b.profitPercent, 0) / buckets.length) * 10) / 10
      : 0;
    const status = avgProfitPercent >= 18 ? "Profitable" : avgProfitPercent >= 14 ? "Saturated" : "Loss";

    return res.json({ buckets, kpis: { totalRevenue, avgProfitPercent, status } });
  } catch (err) {
    return res.status(500).json({ message: "Failed to compute analytics" });
  }
}


