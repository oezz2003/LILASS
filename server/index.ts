import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { connectToDatabase } from "./config/db";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import orderRoutes from "./routes/orders";
import paymentRoutes from "./routes/payments";
import analyticsRoutes from "./routes/analytics";
import stockRoutes from "./routes/stock";
import feedbackRoutes from "./routes/feedback";
import financeRoutes from "./routes/finance";
import storeRoutes from "./routes/store";
import customerServiceRoutes from "./routes/customerService";
import contentRoutes from "./routes/content";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Database
  connectToDatabase().catch((err) => {
    console.error("Mongo connection error", err);
  });

  // API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/stock", stockRoutes);
  app.use("/api/feedback", feedbackRoutes);
  app.use("/api/finance", financeRoutes);
  app.use("/api/store", storeRoutes);
  app.use("/api/cs", customerServiceRoutes);
  app.use("/api/content", contentRoutes);

  return app;
}

// If this file is run directly, start the server
const app = createServer();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`🚀 API Server running on port ${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
