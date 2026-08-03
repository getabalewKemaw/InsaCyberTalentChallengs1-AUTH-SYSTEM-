import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import * as commentService from "../services/comment.service.js";
import { createCommentSchema, updateCommentSchema } from "../schemas/documents.schema.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { getUserId } from "../utils/auth.utils.js";
import { validate } from "../utils/validation.utils.js";
import { success, created, noContent } from "../utils/response.utils.js";
import { NotFoundError } from "../errors/not-found.error.js";

export const getComments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const comments = await commentService.getComments(id);
  return success(res, comments);
});

export const addComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const id = req.params.id as string;

  const data = validate(createCommentSchema, req.body);
  const newComment = await commentService.addComment(id, userId, data.content);
  return created(res, newComment);
});

export const updateComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const commentId = req.params.commentId as string;
  const comment = await commentService.getCommentById(commentId);
  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  const data = validate(updateCommentSchema, req.body);
  const updated = await commentService.updateComment(commentId, data as any);
  return success(res, updated);
});

export const deleteComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const commentId = req.params.commentId as string;
  const comment = await commentService.getCommentById(commentId);
  if (!comment) {
    throw new NotFoundError("Comment not found");
  }

  await commentService.deleteComment(commentId);
  return noContent(res);
});
