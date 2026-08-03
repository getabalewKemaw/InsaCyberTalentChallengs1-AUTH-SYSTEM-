import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "./auth.middleware.js";
import * as documentService from "../services/document.service.js";
import * as commentService from "../services/comment.service.js";
import { asyncHandler } from "./async-handler.middleware.js";
import { getUserId } from "../utils/auth.utils.js";
import { ForbiddenError } from "../errors/forbidden.error.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { PermissionLevel, type PermissionLevelType } from "../constants/permission.constants.js";

export const authorizeDocument = (level: PermissionLevelType = PermissionLevel.VIEWER) => {
  return asyncHandler(async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const userId = getUserId(req);
    let documentId = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const commentParam = req.params.commentId;
    const commentId = Array.isArray(commentParam) ? commentParam[0] : commentParam;

    // Handle routes operating on commentId (e.g. PATCH /comments/:commentId or DELETE /comments/:commentId)
    if (!documentId && commentId) {
      const comment = await commentService.getCommentById(commentId);
      if (!comment) {
        throw new NotFoundError("Comment not found");
      }
      if (comment.userId === userId) {
        return next();
      }
      documentId = comment.documentId;
    }

    if (!documentId) {
      throw new ForbiddenError("Missing document context");
    }

    if (level === PermissionLevel.OWNER) {
      const doc = await documentService.getDocumentById(documentId);
      if (!doc) throw new NotFoundError("Document not found");
      if (doc.ownerId !== userId) {
        throw new ForbiddenError("Only the document owner can perform this action");
      }
      return next();
    }

    const canAccess = await documentService.canAccessDocument(documentId, userId, level);
    if (!canAccess) {
      throw new ForbiddenError(`Insufficient permissions. Required access level: ${level}`);
    }

    next();
  });
};
