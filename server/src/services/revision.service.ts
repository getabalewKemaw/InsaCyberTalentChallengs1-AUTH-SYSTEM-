import * as revisionRepo from "../repositories/revision.repository.js";
import { generateId } from "../utils/id.utils.js";

export const getRevisions = async (documentId: string) => {
  return await revisionRepo.getRevisionsByDocumentId(documentId);
};

export const getRevisionById = async (revisionId: string) => {
  return await revisionRepo.getRevisionById(revisionId);
};

export const addRevision = async (documentId: string, content: string) => {
  const id = generateId();
  return await revisionRepo.createRevision({ id, documentId, content });
};
