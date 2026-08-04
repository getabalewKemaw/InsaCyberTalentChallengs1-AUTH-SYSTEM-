import { fetchApi } from "@/utils/api.utils";
import type { Document, PermissionLevel } from "@/types/document.types";
import type { Comment } from "@/types/comment.types";
import type { Revision } from "@/types/revision.types";

export const documentService = {
  getDocuments: (): Promise<Document[]> => fetchApi<Document[]>("/documents"),

  getDocument: (id: string): Promise<Document> => fetchApi<Document>(`/documents/${id}`),

  createDocument: (title: string): Promise<Document> =>
    fetchApi<Document>("/documents", {
      method: "POST",
      body: { title } as any,
    }),

  updateDocument: (id: string, title?: string, content?: string): Promise<Document> =>
    fetchApi<Document>(`/documents/${id}`, {
      method: "PATCH",
      body: { title, content } as any,
    }),

  // Auto-save: persists the HTML content of the document to the server.
  saveContent: (id: string, content: string): Promise<Document> =>
    fetchApi<Document>(`/documents/${id}`, {
      method: "PATCH",
      body: { content } as any,
    }),

  // Save the Yjs binary document state (base64-encoded Uint8Array).
  saveYjsState: (id: string, content: string): Promise<Document> =>
    fetchApi<Document>(`/documents/${id}`, {
      method: "PATCH",
      body: { content } as any,
      keepalive: true,
    }),

  deleteDocument: (id: string): Promise<void> =>
    fetchApi<void>(`/documents/${id}`, {
      method: "DELETE",
    }),

  // Comments
  getComments: (documentId: string): Promise<Comment[]> =>
    fetchApi<Comment[]>(`/documents/${documentId}/comments`),

  addComment: (documentId: string, content: string): Promise<Comment> =>
    fetchApi<Comment>(`/documents/${documentId}/comments`, {
      method: "POST",
      body: { content } as any,
    }),

  resolveComment: (commentId: string): Promise<Comment> =>
    fetchApi<Comment>(`/documents/comments/${commentId}`, {
      method: "PATCH",
      body: { resolved: true } as any,
    }),

  deleteComment: (commentId: string): Promise<void> =>
    fetchApi<void>(`/documents/comments/${commentId}`, {
      method: "DELETE",
    }),

  // Revisions
  getRevisions: (documentId: string): Promise<Revision[]> =>
    fetchApi<Revision[]>(`/documents/${documentId}/revisions`),

  createRevision: (documentId: string, name?: string): Promise<Revision> =>
    fetchApi<Revision>(`/documents/${documentId}/revisions`, {
      method: "POST",
      body: { name } as any,
    }),

  restoreRevision: (documentId: string, revisionId: string): Promise<Document> =>
    fetchApi<Document>(`/documents/${documentId}/revisions/${revisionId}/restore`, {
      method: "POST",
    }),

  // Sharing & Duplication
  shareDocument: (documentId: string, email: string, permissionLevel: PermissionLevel): Promise<any> =>
    fetchApi<any>(`/documents/${documentId}/share`, {
      method: "POST",
      body: { email, permissionLevel } as any,
    }),

  duplicateDocument: (documentId: string): Promise<Document> =>
    fetchApi<Document>(`/documents/${documentId}/duplicate`, {
      method: "POST",
    }),
};
