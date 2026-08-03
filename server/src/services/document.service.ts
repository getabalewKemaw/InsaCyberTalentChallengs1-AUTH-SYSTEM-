import * as docRepo from "../repositories/document.repository.js";
import type { UpdateDocumentInput } from "../repositories/document.repository.js";
import * as permRepo from "../repositories/permission.repository.js";
import { PermissionLevel, type PermissionLevelType } from "../constants/permission.constants.js";
import { generateId } from "../utils/id.utils.js";

export const createDocument = async (title: string, ownerId: string) => {
  const id = generateId();
  return await docRepo.createDocument({ id, title, ownerId });
};

export const getDocumentById = async (id: string) => {
  return await docRepo.getDocumentById(id);
};

export const getUserDocuments = async (userId: string) => {
  return await docRepo.getUserDocuments(userId);
};

export const updateDocument = async (id: string, title?: string, content?: string) => {
  const updateData: UpdateDocumentInput = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  return await docRepo.updateDocument(id, updateData);
};

export const deleteDocument = async (id: string) => {
  return await docRepo.deleteDocument(id);
};

export const getUserPermissionLevel = async (
  documentId: string,
  userId: string
): Promise<PermissionLevel> => {
  const doc = await docRepo.getDocumentById(documentId);
  if (!doc) return PermissionLevel.VIEWER;
  if (doc.ownerId === userId) return PermissionLevel.OWNER;
  const perm = await permRepo.getUserPermission(documentId, userId);
  return (perm?.permissionLevel as PermissionLevel) || PermissionLevel.VIEWER;
};

export const canAccessDocument = async (
  documentId: string,
  userId: string,
  requiredLevel: PermissionLevelType = PermissionLevel.VIEWER
): Promise<boolean> => {
  const doc = await docRepo.getDocumentById(documentId);
  if (!doc) return false;

  if (doc.ownerId === userId) return true;

  const perm = await permRepo.getUserPermission(documentId, userId);
  if (!perm) return false;

  if (requiredLevel === PermissionLevel.VIEWER) return true;
  if (
    requiredLevel === PermissionLevel.COMMENTER &&
    (perm.permissionLevel === PermissionLevel.COMMENTER || perm.permissionLevel === PermissionLevel.EDITOR)
  ) {
    return true;
  }
  if (requiredLevel === PermissionLevel.EDITOR && perm.permissionLevel === PermissionLevel.EDITOR) {
    return true;
  }

  return false;
};
