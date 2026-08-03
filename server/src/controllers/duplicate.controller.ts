import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import * as documentService from "../services/document.service.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { getUserId } from "../utils/auth.utils.js";
import { created } from "../utils/response.utils.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { AppError } from "../errors/app.error.js";

export const duplicateDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const id = req.params.id as string;

  const originalDoc = await documentService.getDocumentById(id);
  if (!originalDoc) {
    throw new NotFoundError("Original document not found");
  }

  const duplicatedTitle = `${originalDoc.title} (Copy)`;
  const newDoc = await documentService.createDocument(duplicatedTitle, userId);

  if (!newDoc) {
    throw new AppError("Failed to duplicate document", 500);
  }

  if (originalDoc.content) {
    await documentService.updateDocument(newDoc.id, undefined, originalDoc.content);
  }

  return created(res, newDoc);
});
