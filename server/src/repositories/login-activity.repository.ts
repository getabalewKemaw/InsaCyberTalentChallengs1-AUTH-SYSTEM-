import { eq, desc } from "drizzle-orm";
import { db } from "../config/db.js";
import * as schema from "../db/schema.js";

export interface CreateLoginActivityParams {
  userId: string;
  email: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
  status: "SUCCESS" | "FAILED" | "SUSPICIOUS";
  reason: string;
}

export async function createLoginActivityLog(params: CreateLoginActivityParams) {
  const activityId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  await db.insert(schema.loginActivity).values({
    id: activityId,
    userId: params.userId,
    email: params.email,
    ipAddress: params.ipAddress || "unknown",
    userAgent: params.userAgent || "unknown",
    status: params.status,
    reason: params.reason,
  });
}

export async function findLoginActivityByUserId(userId: string, limit = 20) {
  return await db
    .select()
    .from(schema.loginActivity)
    .where(eq(schema.loginActivity.userId, userId))
    .orderBy(desc(schema.loginActivity.createdAt))
    .limit(limit);
}
