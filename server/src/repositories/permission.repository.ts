import { eq, and } from "drizzle-orm";
import { db } from "../config/db.js";
import { permission } from "../db/schema.js";
import type { PermissionLevelType } from "../constants/permission.constants.js";

export interface CreatePermissionInput {
  id: string;
  documentId: string;
  userId: string;
  permissionLevel: PermissionLevelType;
}

export const getUserPermission = async (documentId: string, userId: string) => {
  const [perm] = await db
    .select()
    .from(permission)
    .where(and(eq(permission.documentId, documentId), eq(permission.userId, userId)));

  return perm || null;
};

export const createPermission = async (data: CreatePermissionInput) => {
  const [newPerm] = await db
    .insert(permission)
    .values({
      id: data.id,
      documentId: data.documentId,
      userId: data.userId,
      permissionLevel: data.permissionLevel,
    })
    .returning();

  return newPerm;
};

export const updatePermission = async (id: string, permissionLevel: PermissionLevelType) => {
  const [updated] = await db
    .update(permission)
    .set({ permissionLevel })
    .where(eq(permission.id, id))
    .returning();

  return updated || null;
};
