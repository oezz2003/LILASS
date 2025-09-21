import { Request, Response } from "express";
import Stripe from "stripe";
import { Payment } from "../models/Payment";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2024-06-20" }) : null;

export async function initiatePayment(req: Request, res: Response) {
  try {
    const { provider = "stripe", amount, currency = "usd", orderId } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const payment = await Payment.create({ provider, amount, currency, orderId, status: "created" });

    if (provider === "stripe") {
      if (!stripe) return res.status(500).json({ message: "Stripe not configured" });
      const intent = await stripe.paymentIntents.create({ amount: Math.round(amount * 100), currency });
      payment.externalId = intent.id;
      await payment.save();
      return res.status(201).json({ payment, clientSecret: intent.client_secret });
    }

    if (provider === "paypal") {
      // Placeholder for PayPal integration
      return res.status(501).json({ message: "PayPal not implemented yet" });
    }

    return res.status(201).json({ payment });
  } catch (err) {
    return res.status(500).json({ message: "Failed to initiate payment" });
  }
}



