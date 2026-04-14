import { NextFunction, Request, Response } from "express";
import * as admin from "firebase-admin";

export interface AuthRequest extends Request {
  userId?: string;
  userName?: string;
  userRole?: string;
}

// ── Protect route — verify Firebase token ──────────────────
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.userId   = decoded.uid;
    req.userName = decoded.name || decoded.email || "User";
    req.userRole = (decoded as any).role || "citizen";
    next();
  } catch (e) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// ── Admin only ─────────────────────────────────────────────
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
};