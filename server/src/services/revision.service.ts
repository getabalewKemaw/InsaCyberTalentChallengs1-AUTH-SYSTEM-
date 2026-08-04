import * as revisionRepo from "../repositories/revision.repository.js";
import { generateId } from "../utils/id.utils.js";

export const getRevisions = async (documentId: string) => {
  return await revisionRepo.getRevisionsByDocumentId(documentId);
};

export const getRevisionById = async (revisionId: string) => {
  return await revisionRepo.getRevisionById(revisionId);
};

export const addRevision = async (
  documentId: string,
  content: string,
  userId?: string | null,
  name?: string | null,
  isAutoSave?: boolean
) => {
  const id = generateId();
  return await revisionRepo.createRevision({
    id,
    documentId,
    content,
    userId: userId ?? null,
    name: name ?? null,
    isAutoSave: isAutoSave ?? true,
  });
};

export const addAutoSaveRevision = async (documentId: string, content: string) => {
  const revisions = await revisionRepo.getRevisionsByDocumentId(documentId);
  const latestRevision = revisions[0];

  if (latestRevision) {
    const elapsedMs = Date.now() - new Date(latestRevision.createdAt).getTime();
    const fiveMinutesMs = 5 * 60 * 1000;
    if (elapsedMs < fiveMinutesMs) {
      return latestRevision;
    }
  }

  return await addRevision(documentId, content, null, null, true);
};
