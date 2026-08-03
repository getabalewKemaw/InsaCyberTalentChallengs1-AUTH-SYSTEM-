import type { Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import {
  getUserSessions as fetchUserSessions,
  revokeSession as executeRevokeSession,
  revokeOtherSessions as executeRevokeOtherSessions,
} from "../services/session.service.js";
import { getUserLoginActivity as fetchUserLoginActivity } from "../services/login-activity.service.js";
export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  res.json({
    user: req.user,
    session: req.session,
  });
}
export async function getSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const currentSessionId = req.session!.id;
    const sessions = await fetchUserSessions(userId, currentSessionId);
    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ error: "failed to fetch user sessions." });
  }
}

export async function revokeSession(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { sessionId } = req.body;
    if (!sessionId || typeof sessionId !== "string") {
      res.status(400).json({ error: "sessionId string parameter is required." });
      return;
    }
    const result = await executeRevokeSession(
      req.user!.id,
      sessionId,
      fromNodeHeaders(req.headers)
    );

    if (!result.success) {
      res.status(404).json({ error: "Session not found or access denied." });
      return;
    }
    res.json({ success: true, message: "Session revoked successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to revoke session." });
  }
}
export async function revokeOtherSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    await executeRevokeOtherSessions(fromNodeHeaders(req.headers));
    res.json({ success: true, message: "All other sessions revoked successfully." });
  } catch (error) {
    res.status(500).json({ error: "Failed to revoke other sessions." });
  }
}
export async function getLoginActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const result = await fetchUserLoginActivity(req.user!.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch login activity history." });
  }
}
