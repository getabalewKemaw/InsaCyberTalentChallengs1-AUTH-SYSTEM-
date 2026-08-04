import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import * as revisionService from "../services/revision.service.js";
import * as documentService from "../services/document.service.js";
import { asyncHandler } from "../middlewares/async-handler.middleware.js";
import { success } from "../utils/response.utils.js";
import { NotFoundError } from "../errors/not-found.error.js";
import { hocuspocusServer } from "../realtime/hocuspocus.server.js";

export const getRevisions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const revisions = await revisionService.getRevisions(id);
  return success(res, revisions);
});

export const createManualRevision = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const { name } = req.body as { name?: string };
  const userId = req.user?.id;

  const doc = await documentService.getDocumentById(id);
  if (!doc) {
    throw new NotFoundError("Document not found");
  }

  const newRevision = await revisionService.addRevision(
    id,
    doc.content || "",
    userId,
    name || "Saved Version",
    false
  );

  return success(res, newRevision);
});

export const restoreRevision = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const revId = req.params.revId as string;
  const userId = req.user?.id;

  const revision = await revisionService.getRevisionById(revId);
  if (!revision) {
    throw new NotFoundError("Revision not found");
  }

  // 1. Update the document in database
  const updatedDoc = await documentService.updateDocument(id, undefined, revision.content || "");

  // 2. Create a new revision event representing the restoration
  const formattedDate = revision.createdAt
    ? new Date(revision.createdAt as any).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  await revisionService.addRevision(
    id,
    revision.content || "",
    userId,
    `Restored to version from ${formattedDate}`,
    false
  );

  // 3. Unload the document from Hocuspocus memory so active connections pull the new state from DB
  try {
    const documentInstance =
      hocuspocusServer.documents.get("collaboration/" + id) ||
      hocuspocusServer.documents.get(id);
    if (documentInstance) {
      await hocuspocusServer.unloadDocument(documentInstance);
    }
  } catch (err) {
    console.error("[Hocuspocus] Failed to unload document on restore:", err);
  }

  return success(res, updatedDoc);
});
