import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import * as documentService from "../services/document.service.js";
import * as revisionService from "../services/revision.service.js";
import { createDocumentSchema, updateDocumentSchema } from "../schemas/documents.schema.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { getUserId } from "../utils/auth.utils.js";
import { validate } from "../utils/validation.utils.js";
import { success, created, noContent } from "../utils/response.utils.js";
import { NotFoundError } from "../errors/not-found.error.js";

export const createDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const data = validate(createDocumentSchema, req.body);
  const newDoc = await documentService.createDocument(data.title, userId);
  return created(res, newDoc);
});

export const getDocuments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const docs = await documentService.getUserDocuments(userId);
  return success(res, docs);
});

export const getDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = getUserId(req);
  const id = req.params.id as string;

  const doc = await documentService.getDocumentById(id);
  if (!doc) {
    throw new NotFoundError("Document not found");
  }

  const userPermission = await documentService.getUserPermissionLevel(id, userId);
  return success(res, { ...doc, userPermission });
});

export const updateDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const data = validate(updateDocumentSchema, req.body);
  const updated = await documentService.updateDocument(id, data.title, data.content);

  if (data.content !== undefined) {
    await revisionService.addRevision(id, data.content);
  }

  return success(res, updated);
});

export const deleteDocument = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const doc = await documentService.getDocumentById(id);
  if (!doc) {
    throw new NotFoundError("Document not found");
  }

  await documentService.deleteDocument(id);
  return noContent(res);
});
