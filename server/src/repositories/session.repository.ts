import { eq, and, ne, desc } from "drizzle-orm";
import { db } from "../config/db.js";
import * as schema from "../db/schema.js";

export async function findSessionsByUserId(userId: string) {
  return await db
    .select({
      id: schema.session.id,
      ipAddress: schema.session.ipAddress,
      userAgent: schema.session.userAgent,
      createdAt: schema.session.createdAt,
      expiresAt: schema.session.expiresAt,
    })
    .from(schema.session)
    .where(eq(schema.session.userId, userId))
    .orderBy(desc(schema.session.createdAt));
}

export async function findSessionByIdAndUserId(sessionId: string, userId: string) {
  const [targetSession] = await db
    .select()
    .from(schema.session)
    .where(
      and(
        eq(schema.session.id, sessionId),
        eq(schema.session.userId, userId)
      )
    )
    .limit(1);
  return targetSession || null;
}

export async function findLatestPreviousSession(userId: string, excludeSessionId: string) {
  const [prevSession] = await db
    .select({
      ipAddress: schema.session.ipAddress,
      userAgent: schema.session.userAgent,
    })
    .from(schema.session)
    .where(
      and(
        eq(schema.session.userId, userId),
        ne(schema.session.id, excludeSessionId)
      )
    )
    .orderBy(desc(schema.session.createdAt))
    .limit(1);
  return prevSession || null;
}
