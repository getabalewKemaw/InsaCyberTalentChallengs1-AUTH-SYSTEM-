import * as permRepo from "../repositories/permission.repository.js";
import { generateId } from "../utils/id.utils.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { db } from "../config/db.js";
import { user } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { PermissionLevelType } from "../constants/permission.constants.js";

export const shareDocument = async (
  documentId: string,
  email: string,
  permissionLevel: PermissionLevelType
) => {
  const [targetUser] = await db.select().from(user).where(eq(user.email, email));

  if (!targetUser) {
    throw new NotFoundError("User not found with provided email");
  }

  // Business logic: check if permission already exists
  const existing = await permRepo.getUserPermission(documentId, targetUser.id);

  if (existing) {
    return await permRepo.updatePermission(existing.id, permissionLevel);
  }

  const id = generateId();
  return await permRepo.createPermission({
    id,
    documentId,
    userId: targetUser.id,
    permissionLevel,
  });
};
