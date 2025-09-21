import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; role?: string };
}

export function authenticateJwt(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");
    const payload = jwt.verify(token, secret) as { id: string; role?: string };
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function signJwt(payload: object, expiresIn: string | number = "7d") {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return jwt.sign(payload as any, secret, { expiresIn });
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!roles.length || roles.includes(req.user.role || "")) return next();
    return res.status(403).json({ message: "Forbidden" });
  };
}



