import { eq, or, desc, inArray } from "drizzle-orm";
import { db } from "../config/db.js";
import { document, permission } from "../db/schema.js";

export interface CreateDocumentInput {
  id: string;
  title: string;
  ownerId: string;
  content?: string;
}

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
}

export const createDocument = async (data: CreateDocumentInput) => {
  const [newDoc] = await db
    .insert(document)
    .values({
      id: data.id,
      title: data.title,
      ownerId: data.ownerId,
      content: data.content ?? "",
    })
    .returning();
  return newDoc;
};

export const getDocumentById = async (id: string) => {
  const [doc] = await db.select().from(document).where(eq(document.id, id));
  return doc || null;
};

export const getUserDocuments = async (userId: string) => {
  // Get all document IDs user has access to via permission records
  const userPerms = await db
    .select({ documentId: permission.documentId })
    .from(permission)
    .where(eq(permission.userId, userId));

  const sharedDocIds = userPerms.map((p) => p.documentId);

  // Fetch documents owned by user OR in sharedDocIds
  const condition =
    sharedDocIds.length > 0
      ? or(eq(document.ownerId, userId), inArray(document.id, sharedDocIds))
      : eq(document.ownerId, userId);

  return await db
    .select({
      id: document.id,
      title: document.title,
      ownerId: document.ownerId,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    })
    .from(document)
    .where(condition)
    .orderBy(desc(document.updatedAt));
};

export const updateDocument = async (id: string, data: UpdateDocumentInput) => {
  const updateData: Partial<typeof document.$inferInsert> = {};
  if (data.title !== undefined) updateData.title = data.title;
  if (data.content !== undefined) updateData.content = data.content;

  if (Object.keys(updateData).length === 0) return null;

  const [updated] = await db
    .update(document)
    .set(updateData)
    .where(eq(document.id, id))
    .returning();

  return updated || null;
};

export const deleteDocument = async (id: string) => {
  const [deleted] = await db.delete(document).where(eq(document.id, id)).returning();
  return deleted || null;
};
