export type PermissionLevel = "owner" | "editor" | "commenter" | "viewer";

export interface Document {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  userPermission?: PermissionLevel;
}

export interface ShareDocumentInput {
  email: string;
  permissionLevel: PermissionLevel;
}
