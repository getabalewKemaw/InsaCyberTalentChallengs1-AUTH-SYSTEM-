import { eq, desc } from "drizzle-orm";
import { db } from "../config/db.js";
import { revision } from "../db/schema.js";

export interface CreateRevisionInput {
  id: string;
  documentId: string;
  content: string;
}

export const getRevisionsByDocumentId = async (documentId: string) => {
  return await db
    .select()
    .from(revision)
    .where(eq(revision.documentId, documentId))
    .orderBy(desc(revision.createdAt));
};

export const getRevisionById = async (revisionId: string) => {
  const [rev] = await db.select().from(revision).where(eq(revision.id, revisionId));
  return rev || null;
};

export const createRevision = async (data: CreateRevisionInput) => {
  const [newRev] = await db
    .insert(revision)
    .values({
      id: data.id,
      documentId: data.documentId,
      content: data.content,
    })
    .returning();

  return newRev;
};
