import { useMemo, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, Smile, Frown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  addDays,
  eachDayOfInterval,
  eachHourOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  endOfYear,
  format,
  getDate,
  getMonth,
  getYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

// Deterministic synthetic data generator with seeded variability
function seededNoise(y: number, m: number, d: number, h: number) {
  const s = y * 1_000_000 + (m + 1) * 10_000 + d * 100 + h;
  const x = Math.sin(s) * 43758.5453;
  return x - Math.floor(x);
}

function metricsFor(date: Date) {
  const dow = date.getDay();
  const hour = date.getHours();
  const baseDay =
    800 + (dow === 6 ? 700 : dow === 5 ? 450 : dow === 0 ? -150 : 0);
  const rushMorning = hour >= 7 && hour < 11 ? 320 : 0;
  const rushEvening = hour >= 16 && hour < 19 ? 420 : 0;
  const seasonal = (getMonth(date) % 4) * 70;
  const noise =
    (seededNoise(getYear(date), getMonth(date), getDate(date), hour) - 0.5) *
    180;
  const revenue = baseDay / 24 + rushMorning + rushEvening + seasonal + noise;
  const profit =
    10 +
    (dow % 4) * 2 +
    (rushMorning ? 3 : 0) +
    (rushEvening ? 2 : 0) +
    seededNoise(getYear(date), getMonth(date), getDate(date), hour);
  return {
    revenue: Math.max(30, Math.round(revenue)),
    profit: Math.round(profit * 10) / 10,
  };
}

function sumRevenue(data: { revenue: number }[]) {
  return data.reduce((a, b) => a + b.revenue, 0);
}

export default function Overview() {
  const now = new Date();
  const [scale, setScale] = useState<
    "yearly" | "quarterly" | "monthly" | "weekly" | "hourly"
  >("weekly");
  const [year, setYear] = useState<number | "all">(getYear(now));
  const [quarter, setQuarter] = useState<"all" | 1 | 2 | 3 | 4>("all");
  const [month, setMonth] = useState<number>(getMonth(now) + 1); // 1-12
  const [week, setWeek] = useState<number>(1); // 1-5
  const intervals = [
    { label: "09–12", start: 9, end: 12 },
    { label: "12–15", start: 12, end: 15 },
    { label: "15–18", start: 15, end: 18 },
    { label: "18–21", start: 18, end: 21 },
    { label: "21–24", start: 21, end: 24 },
  ] as const;
  const [intervalIdx, setIntervalIdx] = useState(0);

  const years = useMemo(() => {
    const cy = getYear(now);
    return Array.from({ length: 6 }, (_, i) => cy - 5 + i);
  }, [now]);

  const monthsAll = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        value: i + 1,
        label: format(new Date(2000, i, 1), "MMM"),
      })),
    [],
  );

  const monthsToShow = useMemo(() => {
    if (quarter === "all") return monthsAll;
    const start = (quarter - 1) * 3 + 1;
    const end = start + 2;
    return monthsAll.filter((m) => m.value >= start && m.value <= end);
  }, [monthsAll, quarter]);

  const effectiveMonth = useMemo(() => {
    if (quarter === "all") return month;
    const start = (quarter - 1) * 3 + 1;
    const end = start + 2;
    return Math.min(Math.max(month, start), end);
  }, [month, quarter]);

  const currentMonthLabel = format(
    new Date(
      typeof year === "number" ? year : getYear(now),
      effectiveMonth - 1,
      1,
    ),
    "MMM yyyy",
  );

  // Build dataset via API based on selections
  const analyticsQuery = useQuery({
    queryKey: [
      "overview-analytics",
      scale,
      year,
      quarter,
      effectiveMonth,
      week,
      intervalIdx,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("scale", scale);
      if (typeof year === "number") params.set("year", String(year));
      if (quarter !== "all") params.set("quarter", String(quarter));
      params.set("month", String(effectiveMonth));
      params.set("week", String(week));
      if (scale === "hourly") {
        const iv = intervals[intervalIdx];
        params.set("intervalStart", String(iv.start));
        params.set("intervalEnd", String(iv.end));
      }
      const res = await fetch(`/api/analytics/overview?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load analytics");
      return (await res.json()) as {
        buckets: { label: string; revenue: number; profitPercent: number }[];
        kpis: { totalRevenue: number; avgProfitPercent: number; status: string };
      };
    },
  });

  const stockQuery = useQuery({
    queryKey: ["stock-low"],
    queryFn: async () => {
      const res = await fetch(`/api/stock/low`);
      if (!res.ok) throw new Error("Failed to load stock");
      return (await res.json()) as { lowCount: number };
    },
  });

  const feedbackQuery = useQuery({
    queryKey: ["feedback-summary", scale, year, effectiveMonth, week, intervalIdx],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("scale", scale);
      const res = await fetch(`/api/feedback/summary?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load feedback");
      return (await res.json()) as { positiveRate: number; negativeRate: number };
    },
  });

  if (analyticsQuery.error) toast({ title: "Analytics error", description: String(analyticsQuery.error) });
  if (stockQuery.error) toast({ title: "Stock error", description: String(stockQuery.error) });
  if (feedbackQuery.error) toast({ title: "Feedback error", description: String(feedbackQuery.error) });

  const data = (analyticsQuery.data?.buckets ?? []).map((b) => ({
    label: b.label,
    revenue: b.revenue,
    profit: b.profitPercent,
  }));

  const totalRevenue = analyticsQuery.data?.kpis.totalRevenue ?? 0;
  const avgProfit = analyticsQuery.data?.kpis.avgProfitPercent ?? 0;

  const status: {
    label: "Profitable" | "Saturated" | "Loss";
    color: string;
    icon: JSX.Element;
  } = useMemo(() => {
    if (avgProfit >= 18)
      return {
        label: "Profitable",
        color: "text-emerald-700",
        icon: <TrendingUp className="size-5" />,
      };
    if (avgProfit >= 14)
      return {
        label: "Saturated",
        color: "text-amber-700",
        icon: <TrendingUp className="size-5" />,
      };
    return {
      label: "Loss",
      color: "text-rose-700",
      icon: <TrendingDown className="size-5" />,
    };
  }, [avgProfit]);

  // Dynamic feedback derived from selection & data trend
  const positiveRate = useMemo(() => {
    const arr = data as any[];
    if (!arr.length) return 50;
    const first = arr[0]?.revenue ?? 0;
    const last = arr[arr.length - 1]?.revenue ?? 0;
    const growth = first > 0 ? (last - first) / first : 0;
    const base = 72 + Math.tanh(growth) * 10 + (avgProfit - 14) * 2; // bounded influence from trend and margin
    return Math.min(98, Math.max(5, Math.round(base)));
  }, [data, avgProfit]);
  const negativeRate = 100 - positiveRate;

  const itemsLow = stockQuery.data?.lowCount ?? 0;
  const needsStockAction = itemsLow > 0;

  return (
    <DashboardLayout title="Overview">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs value={scale} onValueChange={(v) => setScale(v as any)}>
          <TabsList>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
            <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="hourly">Hourly</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Total Revenue</span>
          <Badge variant="secondary">${totalRevenue.toLocaleString()}</Badge>
          <span className="ml-2">Avg Profit %</span>
          <Badge variant="secondary">{avgProfit.toFixed(1)}%</Badge>
        </div>
      </div>

      {/* selectors */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3">
        <Select
          value={String(year)}
          onValueChange={(v) => setYear(v === "all" ? "all" : Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(quarter)}
          onValueChange={(v) =>
            setQuarter(v === "all" ? "all" : (Number(v) as any))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Quarter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="1">Q1</SelectItem>
            <SelectItem value="2">Q2</SelectItem>
            <SelectItem value="3">Q3</SelectItem>
            <SelectItem value="4">Q4</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={String(effectiveMonth)}
          onValueChange={(v) => setMonth(Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {monthsToShow.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(week)} onValueChange={(v) => setWeek(Number(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Week" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">All</SelectItem>
            {[1, 2, 3, 4].map((w) => (
              <SelectItem key={w} value={String(w)}>{`Wk ${w}`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={String(intervalIdx)}
          onValueChange={(v) => setIntervalIdx(Number(v))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Interval" />
          </SelectTrigger>
          <SelectContent>
            {intervals.map((iv, i) => (
              <SelectItem key={iv.label} value={String(i)}>
                {iv.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>
              {scale === "monthly"
                ? currentMonthLabel
                : `${scale[0].toUpperCase() + scale.slice(1)} trend`}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data as any}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                />
                <XAxis
                  dataKey="label"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ReTooltip cursor={{ stroke: "hsl(var(--muted))" }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Business Status</CardTitle>
            <CardDescription>Quick health check</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div
              className={`flex items-center gap-2 text-xl font-semibold ${status.color}`}
            >
              {status.icon}
              {status.label}
            </div>
            <Button asChild className="w-full">
              <a href="/finance">Go to Finance</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Profitability</CardTitle>
            <CardDescription>Average margin by {scale}</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data as any}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--muted))"
                />
                <XAxis
                  dataKey="label"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  unit="%"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <ReTooltip cursor={{ stroke: "hsl(var(--muted))" }} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(var(--coffee))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Management</CardTitle>
            <CardDescription>Low items: 8</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div
              className={`text-sm font-medium ${needsStockAction ? "text-amber-700" : "text-emerald-700"}`}
            >
              {needsStockAction ? "Action Needed" : "All Good"}
            </div>
            <Button
              asChild
              variant={needsStockAction ? "default" : "secondary"}
            >
              <a href="/stock">Go to Stock</a>
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="size-5 text-emerald-600" /> Positive Feedback
              </CardTitle>
              <CardDescription>
                {feedbackQuery.data?.positiveRate ?? 0}% positive reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="text-2xl font-semibold text-emerald-700">
                {feedbackQuery.data?.positiveRate ?? 0}%
              </div>
              <Button asChild variant="secondary">
                <a href="/customer-service">Customer Service</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Frown className="size-5 text-rose-600" /> Negative Feedback
              </CardTitle>
              <CardDescription>
                {feedbackQuery.data?.negativeRate ?? 0}% negative reviews
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-4">
              <div className="text-2xl font-semibold text-rose-700">
                {feedbackQuery.data?.negativeRate ?? 0}%
              </div>
              <Button asChild variant="secondary">
                <a href="/customer-service">Customer Service</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
