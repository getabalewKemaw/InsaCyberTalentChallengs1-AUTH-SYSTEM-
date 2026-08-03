import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../config/auth.config.js";
export interface AuthenticatedRequest extends Request {
  user?: typeof auth.$Infer.Session.user;
  session?: typeof auth.$Infer.Session.session;
}
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessionRes = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!sessionRes || !sessionRes.session) {
      res.status(401).json({ error: "Unauthorized. Valid session required." });
      return;
    }

    req.user = sessionRes.user;
    req.session = sessionRes.session;
    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication check failed." });
  }
}
