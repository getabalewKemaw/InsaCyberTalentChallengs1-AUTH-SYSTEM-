import { eq, desc } from "drizzle-orm";
import { db } from "../config/db.js";
import { revision, user } from "../db/schema.js";

export interface CreateRevisionInput {
  id: string;
  documentId: string;
  content: string;
  userId?: string | null;
  name?: string | null;
  isAutoSave?: boolean;
}

export const getRevisionsByDocumentId = async (documentId: string) => {
  const results = await db
    .select({
      id: revision.id,
      documentId: revision.documentId,
      userId: revision.userId,
      name: revision.name,
      content: revision.content,
      isAutoSave: revision.isAutoSave,
      createdAt: revision.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(revision)
    .leftJoin(user, eq(revision.userId, user.id))
    .where(eq(revision.documentId, documentId))
    .orderBy(desc(revision.createdAt));

  return results.map((row) => ({
    ...row,
    user: row.user?.id ? row.user : null,
  }));
};

export const getRevisionById = async (revisionId: string) => {
  const results = await db
    .select({
      id: revision.id,
      documentId: revision.documentId,
      userId: revision.userId,
      name: revision.name,
      content: revision.content,
      isAutoSave: revision.isAutoSave,
      createdAt: revision.createdAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(revision)
    .leftJoin(user, eq(revision.userId, user.id))
    .where(eq(revision.id, revisionId));

  if (results.length === 0) return null;
  const row = results[0];
  if (!row) return null;
  return {
    ...row,
    user: row.user?.id ? row.user : null,
  };
};

export const createRevision = async (data: CreateRevisionInput) => {
  const [newRev] = await db
    .insert(revision)
    .values({
      id: data.id,
      documentId: data.documentId,
      content: data.content,
      userId: data.userId || null,
      name: data.name || null,
      isAutoSave: data.isAutoSave !== undefined ? data.isAutoSave : true,
    })
    .returning();

  return newRev;
};
