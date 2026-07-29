import {
  findSessionsByUserId,
  findSessionByIdAndUserId,
} from "../repositories/session.repository.js";
import { auth } from "../config/auth.config.js";

export async function getUserSessions(userId: string, currentSessionId: string) {
  const activeSessions = await findSessionsByUserId(userId);
  return activeSessions.map((sess) => ({
    ...sess,
    isCurrent: sess.id === currentSessionId,
  }));
}

export async function revokeSession(userId: string, sessionId: string, headers: Headers) {
  const targetSession = await findSessionByIdAndUserId(sessionId, userId);
  if (!targetSession) {
    return { success: false, reason: "NOT_FOUND" };
  }

  await auth.api.revokeSession({
    body: { token: targetSession.token },
    headers,
  });

  return { success: true };
}

export async function revokeOtherSessions(headers: Headers) {
  await auth.api.revokeOtherSessions({
    headers,
  });
  return { success: true };
}
