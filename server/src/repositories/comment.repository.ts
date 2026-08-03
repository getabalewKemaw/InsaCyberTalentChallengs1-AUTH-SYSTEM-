import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { comment } from "../db/schema.js";

export interface CreateCommentInput {
  id: string;
  documentId: string;
  userId: string;
  content: string;
}

export interface UpdateCommentInput {
  content?: string;
  resolved?: boolean;
}

export const getCommentsByDocumentId = async (documentId: string) => {
  return await db
    .select()
    .from(comment)
    .where(eq(comment.documentId, documentId))
    .orderBy(comment.createdAt);
};

export const getCommentById = async (commentId: string) => {
  const [found] = await db.select().from(comment).where(eq(comment.id, commentId));
  return found || null;
};

export const createComment = async (data: CreateCommentInput) => {
  const [newComment] = await db
    .insert(comment)
    .values({
      id: data.id,
      documentId: data.documentId,
      userId: data.userId,
      content: data.content,
    })
    .returning();

  return newComment;
};

export const updateComment = async (commentId: string, updates: UpdateCommentInput) => {
  const [updated] = await db
    .update(comment)
    .set(updates)
    .where(eq(comment.id, commentId))
    .returning();

  return updated || null;
};

export const deleteComment = async (commentId: string) => {
  await db.delete(comment).where(eq(comment.id, commentId));
};
