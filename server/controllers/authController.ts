import { Request, Response } from "express";
import { User } from "../models/User";
import { signJwt } from "../middleware/auth";
import { AuthRequest } from "../middleware/auth";

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({ name, email, password, role });
    const token = signJwt({ id: user._id.toString(), role: user.role });
    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Registration failed" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({ email }).select("+password +role +name +email");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await (user as any).comparePassword(password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = signJwt({ id: user._id.toString(), role: user.role });
    return res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Login failed" });
  }
}

export async function me(req: AuthRequest, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const user = await User.findById(req.user.id).lean();
  if (!user) return res.status(404).json({ message: "Not found" });
  return res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

export async function adminCreateUser(req: AuthRequest, res: Response) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Missing fields" });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });
    const user = await User.create({ name, email, password, role: role ?? "customer" });
    return res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create user" });
  }
}



