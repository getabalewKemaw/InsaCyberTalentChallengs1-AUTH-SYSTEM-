import { findUserById } from "../repositories/user.repository.js";
import { findLatestPreviousSession } from "../repositories/session.repository.js";
import {
  createLoginActivityLog,
  findLoginActivityByUserId,
} from "../repositories/login-activity.repository.js";
export async function processSessionCreation(session: {
  id: string;
  userId: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
}) {
  try {
    const user = await findUserById(session.userId);
    if (!user) return;
    const prevSession = await findLatestPreviousSession(session.userId, session.id);
    let isSuspicious = false;
    let reason = "Standard Login";
    if (prevSession) {
      if (
        session.ipAddress &&
        prevSession.ipAddress &&
        session.ipAddress !== prevSession.ipAddress
      ) {
        isSuspicious = true;
        reason = `Login from new IP address: ${session.ipAddress} (Previous: ${prevSession.ipAddress})`;
      } else if (
        session.userAgent &&
        prevSession.userAgent &&
        session.userAgent !== prevSession.userAgent
      ) {
        isSuspicious = true;
        reason = `Login from new User-Agent/Device`;
      }
    } else {
      reason = "First session created for user";
    }
    await createLoginActivityLog({
      userId: session.userId,
      email: user.email,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      status: isSuspicious ? "SUSPICIOUS" : "SUCCESS",
      reason,
    });
  } catch (err) {
    console.error("[processSessionCreation Error]:", err);
  }
}
export async function getUserLoginActivity(userId: string) {
  const activities = await findLoginActivityByUserId(userId, 20);
  const hasSuspiciousActivity = activities.some(
    (act) => act.status === "SUSPICIOUS"
  );

  return {
    activities,
    hasSuspiciousActivity,
  };
}
