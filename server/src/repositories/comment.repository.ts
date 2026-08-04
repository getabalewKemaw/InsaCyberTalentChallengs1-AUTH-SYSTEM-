import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { comment, user } from "../db/schema.js";

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
  const results = await db
    .select({
      id: comment.id,
      documentId: comment.documentId,
      userId: comment.userId,
      content: comment.content,
      resolved: comment.resolved,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
    .from(comment)
    .leftJoin(user, eq(comment.userId, user.id))
    .where(eq(comment.documentId, documentId))
    .orderBy(comment.createdAt);

  return results.map((row) => ({
    ...row,
    user: row.user?.id ? row.user : null,
  }));
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
