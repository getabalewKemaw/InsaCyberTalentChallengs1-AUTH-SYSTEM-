import type { PermissionLevelType } from "../constants/permission.constants.js";

export interface CreateLoginActivityParams {
  userId: string;
  email: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
  status: "SUCCESS" | "FAILED" | "SUSPICIOUS";
  reason: string;
}
export interface CreateCommentInput {
  id: string;
  documentId: string;
  userId: string;
  content: string;
}

export interface UpdateCommentInput {
  content?: string;
  resolved?: boolean;
}


export interface CreateDocumentInput {
  id: string;
  title: string;
  ownerId: string;
  content?: string;
}

export interface UpdateDocumentInput {
  title?: string;
  content?: string;
}
export interface CreatePermissionInput {
  id: string;
  documentId: string;
  userId: string;
  permissionLevel: PermissionLevelType;
}

export interface CreateRevisionInput {
  id: string;
  documentId: string;
  content: string;
}


export interface CreateLoginActivityParams {
  userId: string;
  email: string;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
  status: "SUCCESS" | "FAILED" | "SUSPICIOUS";
  reason: string;
}