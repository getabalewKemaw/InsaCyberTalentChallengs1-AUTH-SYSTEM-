import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import * as revisionService from "../services/revision.service.js";
import * as documentService from "../services/document.service.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { success } from "../utils/response.utils.js";
import { NotFoundError } from "../errors/not-found.error.js";

export const getRevisions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const revisions = await revisionService.getRevisions(id);
  return success(res, revisions);
});

export const restoreRevision = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const revId = req.params.revId as string;

  const revision = await revisionService.getRevisionById(revId);
  if (!revision) {
    throw new NotFoundError("Revision not found");
  }

  const updatedDoc = await documentService.updateDocument(id, undefined, revision.content);
  return success(res, updatedDoc);
});
