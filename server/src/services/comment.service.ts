import * as commentRepo from "../repositories/comment.repository.js";
import { generateId } from "../utils/id.utils.js";

export const getComments = async (documentId: string) => {
  return await commentRepo.getCommentsByDocumentId(documentId);
};

export const getCommentById = async (commentId: string) => {
  return await commentRepo.getCommentById(commentId);
};

export const addComment = async (documentId: string, userId: string, content: string) => {
  const id = generateId();
  return await commentRepo.createComment({ id, documentId, userId, content });
};

export const updateComment = async (
  commentId: string,
  updates: Partial<{ content: string; resolved: boolean }>
) => {
  return await commentRepo.updateComment(commentId, updates);
};

export const deleteComment = async (commentId: string) => {
  await commentRepo.deleteComment(commentId);
};
